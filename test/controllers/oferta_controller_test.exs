defmodule IascSubastas.OfertaControllerTest do
  use IascSubastas.ConnCase

  alias IascSubastas.Oferta
  alias IascSubastas.Subasta
  @valid_attrs %{comprador: "some content", precio: 42}
  @invalid_attrs %{}

  setup do
    conn = conn() |> put_req_header("accept", "application/json")
    {:ok, conn: conn}
  end

  test "lists all entries on index", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    conn = get conn, subasta_oferta_path(conn, :index, subasta.id)
    assert json_response(conn, 200)["data"] == nil
  end

  test "shows chosen resource", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    oferta = Repo.insert! %Oferta{subasta_id: subasta.id}
    conn = get conn, subasta_oferta_path(conn, :show, subasta.id, oferta)
    assert json_response(conn, 200)["data"] == %{"id" => oferta.id,
      "comprador" => oferta.comprador,
      "precio" => oferta.precio}
  end

  test "does not show resource and instead throw error when id is nonexistent", %{conn: conn} do
    assert_raise Ecto.NoResultsError, fn ->
      get conn, subasta_oferta_path(conn, :show, -1, -1)
    end
  end

  test "creates and renders resource when data is valid", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    conn = post conn, subasta_oferta_path(conn, :create, subasta.id), oferta: @valid_attrs
    assert json_response(conn, 201)["data"]["id"]
    assert Repo.get_by(Oferta, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    conn = post conn, subasta_oferta_path(conn, :create, subasta.id), oferta: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "updates and renders chosen resource when data is valid", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    oferta = Repo.insert! %Oferta{subasta_id: subasta.id}
    conn = put conn, subasta_oferta_path(conn, :show, oferta.subasta_id, oferta), oferta: @valid_attrs
    assert json_response(conn, 200)["data"]["id"]
    assert Repo.get_by(Oferta, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    oferta = Repo.insert! %Oferta{subasta_id: subasta.id}
    conn = put conn, subasta_oferta_path(conn, :show, subasta.id, oferta), oferta: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "deletes chosen resource", %{conn: conn} do
    subasta = Repo.insert! %Subasta{}
    oferta = Repo.insert! %Oferta{subasta_id: subasta.id}
    conn = delete conn, subasta_oferta_path(conn, :delete, subasta.id, oferta)
    assert response(conn, 204)
    refute Repo.get(Oferta, oferta.id)
  end
end
