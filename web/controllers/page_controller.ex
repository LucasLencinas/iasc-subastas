defmodule IascSubastas.PageController do
  use IascSubastas.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
