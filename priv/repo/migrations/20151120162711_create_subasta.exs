defmodule IascSubastas.Repo.Migrations.CreateSubasta do
  use Ecto.Migration

  def change do
    create table(:subastas) do
      add :titulo, :string
      add :precio_base, :float
      add :duracion, :integer

      timestamps
    end

  end
end
