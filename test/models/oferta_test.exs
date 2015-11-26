defmodule IascSubastas.OfertaTest do
  use IascSubastas.ModelCase

  alias IascSubastas.Oferta
  alias IascSubastas.Subasta

  subasta = Repo.insert! %Subasta{}
  @valid_attrs %{comprador: "some content", precio: 42, subasta_id: subasta.id}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Oferta.changeset(%Oferta{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Oferta.changeset(%Oferta{}, @invalid_attrs)
    refute changeset.valid?
  end
end
