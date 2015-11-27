defmodule IascSubastas.OfertaView do
  use IascSubastas.Web, :view

  def render("index.json", %{ofertas: ofertas}) do
    %{data: render_many(ofertas, IascSubastas.OfertaView, "oferta.json")}
  end

  def render("show.json", %{oferta: oferta}) do
    %{data: render_one(oferta, IascSubastas.OfertaView, "oferta.json")}
  end

  def render("oferta.json", %{oferta: oferta}) do
    %{id: oferta.id,
      comprador: oferta.comprador,
      precio: oferta.precio}
  end
end
