defmodule IascSubastas.OfertaControllerTest do
  use IascSubastas.ConnCase

  alias IascSubastas.Oferta
  @valid_attrs %{comprador: "some content", precio: 42}
  @invalid_attrs %{}

  setup do
    conn = conn() |> put_req_header("accept", "application/json")
    {:ok, conn: conn}
  end

  test "lists all entries on index", %{conn: conn} do
    conn = get conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :index)
    assert json_response(conn, 200)["data"] == []
  end

  test "shows chosen resource", %{conn: conn} do
    oferta = Repo.insert! %Oferta{}
    conn = get conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :show, oferta)
    assert json_response(conn, 200)["data"] == %{"id" => oferta.id,
      "comprador" => oferta.comprador,
      "precio" => oferta.precio}
  end

  test "does not show resource and instead throw error when id is nonexistent", %{conn: conn} do
    assert_raise Ecto.NoResultsError, fn ->
      get conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :show, -1)
    end
  end

  test "creates and renders resource when data is valid", %{conn: conn} do
    conn = post conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :create), oferta: @valid_attrs
    assert json_response(conn, 201)["data"]["id"]
    assert Repo.get_by(Oferta, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :create), oferta: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "updates and renders chosen resource when data is valid", %{conn: conn} do
    oferta = Repo.insert! %Oferta{}
    conn = put conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :update, oferta), oferta: @valid_attrs
    assert json_response(conn, 200)["data"]["id"]
    assert Repo.get_by(Oferta, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    oferta = Repo.insert! %Oferta{}
    conn = put conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :update, oferta), oferta: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "deletes chosen resource", %{conn: conn} do
    oferta = Repo.insert! %Oferta{}
    conn = delete conn,         |> put_resp_header("location", oferta_path(conn, :show, oferta))
subasta_oferta_path(conn, :delete, oferta)
    assert response(conn, 204)
    refute Repo.get(Oferta, oferta.id)
  end
end
