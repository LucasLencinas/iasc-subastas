defmodule IascSubastas.Repo.Migrations.AddVendedorToSubastas do
  use Ecto.Migration

  def change do
    alter table(:subastas) do
      add :vendedor, :string
    end
  end
end
