defmodule IascSubastas.OfertaController do
  use IascSubastas.Web, :controller

  alias IascSubastas.Oferta

  plug :obtener_subasta

  def index(conn, _params) do
    ofertas = Repo.all(Oferta)
    render(conn, "index.json", ofertas: ofertas)
  end

  def create(conn, %{"oferta" => oferta_params}) do
    changeset = Oferta.changeset(%Oferta{}, Map.put(oferta_params, "subasta_id", conn.params["subasta_id"]))

    case Repo.insert(changeset) do
      {:ok, oferta} ->
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
    subasta = Repo.get(IascSubastas.Subasta, conn.params["subasta_id"])
    assign(conn, :subasta, subasta)
  end
end
