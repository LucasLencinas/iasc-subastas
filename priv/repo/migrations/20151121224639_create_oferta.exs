defmodule IascSubastas.Repo.Migrations.CreateOferta do
  use Ecto.Migration

  def change do
    create table(:ofertas) do
      add :comprador, :string
      add :precio, :integer
      add :subasta_id, :integer

      timestamps
    end

  end
end
