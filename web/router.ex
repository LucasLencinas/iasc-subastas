defmodule IascSubastas.Router do
  use IascSubastas.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", IascSubastas do
    pipe_through :browser # Use the default browser stack

    get "/", SubastaController, :index
  end

  # Other scopes may use custom stacks.
  scope "/api", IascSubastas do
    pipe_through :api

    resources "/subastas", SubastaController, except: [:new, :edit] do
      post "/cancelar", SubastaController, :cancelar
      resources "/ofertas", OfertaController, except: [:new, :edit]
    end
  end
end
