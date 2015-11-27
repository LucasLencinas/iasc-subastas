defmodule IascSubastas.SubastaView do
  use IascSubastas.Web, :view

  def render("index.json", %{subastas: subastas}) do
    %{data: render_many(subastas, IascSubastas.SubastaView, "subasta.json")}
  end

  def render("show.json", %{subasta: subasta}) do
    %{data: render_one(subasta, IascSubastas.SubastaView, "subasta.json")}
  end

  def render("subasta.json", %{subasta: subasta}) do
    %{id: subasta.id,
      titulo: subasta.titulo,
      precio_base: subasta.precio_base,
      duracion: subasta.duracion,
      terminada: subasta.terminada,
      vendedor: subasta.vendedor,
      mejor_oferta: render_one(subasta.mejor_oferta, IascSubastas.OfertaView, "oferta.json")}
  end
end
