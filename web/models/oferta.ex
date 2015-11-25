defmodule IascSubastas.Oferta do
  use IascSubastas.Web, :model

  schema "ofertas" do
    field :comprador, :string
    field :precio, :integer
    belongs_to :subasta, IascSubastas.Subasta

    timestamps
  end

  @required_fields ~w(comprador precio subasta_id)
  @optional_fields ~w()

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
