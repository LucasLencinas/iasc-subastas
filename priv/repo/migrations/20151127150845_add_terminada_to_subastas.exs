defmodule IascSubastas.Repo.Migrations.AddTerminadaToSubastas do
  use Ecto.Migration

  def change do
    alter table(:subastas) do
      add :terminada, :boolean
    end
  end
end
