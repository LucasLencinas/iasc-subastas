defmodule IascSubastas.OfertaController do
  use IascSubastas.Web, :controller
  require Logger

  alias IascSubastas.Oferta
  alias IascSubastas.Subasta

  plug :obtener_subasta

  def index(conn, _params) do
    render(conn, "index.json", oferta: conn.assigns[:subasta].mejor_oferta)
  end

  def create(conn, %{"oferta" => oferta_params}) do
    changeset = Oferta.changeset(%Oferta{}, Map.put(oferta_params, "subasta_id", conn.params["subasta_id"]))

    cond do
      !es_mejor_oferta(conn.assigns[:subasta], oferta_params["precio"]) ->
        conn
        |> put_status(:bad_request)
        |> render(IascSubastas.ChangesetView, "error.json", changeset: "La oferta anterior es mejor")
      conn.assigns[:subasta].terminada ->
        conn
        |> put_status(:bad_request)
        |> render(IascSubastas.ChangesetView, "error.json", changeset: "La subasta ya terminó")
      true ->
        case Repo.insert(changeset) do
          {:ok, oferta} ->
            # Notificamos a los compradores el nuevo precio
            IascSubastas.Endpoint.broadcast! "subastas:general",
                                             "nueva_oferta",
                                              %{subasta_id: conn.params["subasta_id"],
                                                precio: oferta_params["precio"]}
            conn
            |> put_status(:created)
            |> put_resp_header("location", subasta_oferta_path(conn, :show, conn.params["subasta_id"], oferta))
            |> render("show.json", oferta: oferta)
          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> render(IascSubastas.ChangesetView, "error.json", changeset: changeset)
      end
    end
  end

  def show(conn, %{"id" => id}) do
    oferta = Repo.get!(Oferta, id)
    render(conn, "show.json", oferta: oferta)
  end

  def update(conn, %{"id" => id, "oferta" => oferta_params}) do
    oferta = Repo.get!(Oferta, id)
    changeset = Oferta.changeset(oferta, oferta_params)

    case Repo.update(changeset) do
      {:ok, oferta} ->
        render(conn, "show.json", oferta: oferta)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(IascSubastas.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    oferta = Repo.get!(Oferta, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(oferta)

    send_resp(conn, :no_content, "")
  end

  defp obtener_subasta(conn, _) do
    subasta = Repo.get!(Subasta, conn.params["subasta_id"])
           |> Repo.preload(:mejor_oferta)
    assign(conn, :subasta, subasta)
  end

  def es_mejor_oferta(subasta, precio) do
    is_nil(subasta.mejor_oferta) ||
    precio > subasta.mejor_oferta.precio
  end
end
