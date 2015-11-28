defmodule IascSubastas.SubastaWorker do
  use GenServer
  use IascSubastas.Web, :worker

  require Logger
  import BlockTimer
  alias IascSubastas.Subasta
  alias Ecto.DateTime
  # Callbacks

  def start_link do
    GenServer.start_link(__MODULE__, [])
  end

  def init(_args) do
    subastas = Repo.all from s in Subasta,
                        preload: [:mejor_oferta],
                        where: s.terminada == false
    # TODO: sumar 5 segundos a la duración
    Logger.info"SubastaWorker> Empezando..."
    Enum.each(
      subastas,
      &tiempo_subasta/1
    )
    {:ok, Enum.map(subastas, fn(s) -> s.id end)}
  end

  def handle_call(_mensaje, _from, subastas) do
    {:reply, :ok, subastas}
  end

  def handle_cast({:nueva_subasta, subasta_id}, subastas) do
    {:noreply, [subasta_id|subastas] }
  end

  def handle_cast({:cancela_subasta, subasta_id}, subastas) do
    {:noreply, List.delete(subastas, subasta_id)}
  end

  def tiempo_subasta(subasta) do
    # debería ser duración menos el tiempo que pasó antes (usando inserted_at)
    delay = subasta.duracion
    Logger.info"SubastaWorker> La subasta #{subasta.id} termina en #{delay} segundos..."
    apply_after delay |> seconds, do: termina_subasta(subasta.id)
  end

  def termina_subasta(subasta_id) do
    Logger.info"SubastaWorker> terminó la subasta #{subasta_id}..."
  end
end
