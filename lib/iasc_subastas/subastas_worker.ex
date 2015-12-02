defmodule IascSubastas.SubastaWorker do
  use GenServer
  use IascSubastas.Web, :worker

  require Logger
  import BlockTimer
  alias IascSubastas.Subasta
  alias Ecto.DateTime

  # Callbacks

  def start_link(opts \\ []) do
     GenServer.start_link(__MODULE__, :ok, opts)
   end

  def init(_args) do
    subastas = Repo.all from s in Subasta,
                        preload: [:mejor_oferta],
                        where: s.terminada == false
    # TODO: sumar 5 segundos a la duración
    Logger.info"SubastaWorker> Empezando..."
    Enum.each(
      subastas,
      &tiempo_subasta_caida/1
    )
    {:ok, Enum.map(subastas, fn(s) -> s.id end)}
  end

  def handle_call(_mensaje, _from, subastas) do
    {:reply, :ok, subastas}
  end

  def handle_cast({:nueva_subasta, subasta_id}, subastas) do
    subasta = Repo.get!(Subasta, subasta_id) |> Repo.preload(:mejor_oferta)
    tiempo_subasta(subasta, 0)
    {:noreply, [subasta_id|subastas] }
  end

  def handle_cast({:cancela_subasta, subasta_id}, subastas) do
    termina_subasta(subasta_id)
    {:noreply, List.delete(subastas, subasta_id)}
  end

  def tiempo_subasta_caida(subasta) do
    tiempo_subasta(subasta, 5)
  end

  def tiempo_subasta(subasta, extra) do
    delay = subasta.duracion + extra
    Logger.info"SubastaWorker> La subasta #{subasta.id} termina en #{delay} segundos..."
    apply_after delay |> seconds, do: termina_subasta(subasta.id)
  end

  def termina_subasta(subasta_id) do
    subasta = Repo.get!(Subasta, subasta_id) |> Repo.preload(:mejor_oferta)
    changeset = Subasta.changeset(subasta, %{terminada: true})
    Repo.update(changeset)
    case subasta.mejor_oferta do
      nil ->
        Logger.info"SubastaWorker> terminó la subasta #{subasta_id}, nadie ganó..."
      mejor_oferta ->
        Logger.info"SubastaWorker> terminó la subasta #{subasta_id}, ganó #{mejor_oferta.comprador}..."
    end
  end
end
