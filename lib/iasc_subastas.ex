defmodule IascSubastas do
  use Application
  require Logger
  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    failover_node = System.get_env("failover")

    if failover_node do
      Logger.info "Iniciando back up server"
      Logger.info "Conectando a #{failover_node}"
      Logger.info Node.connect(:"#{failover_node}")
      start_back_up_server(failover_node)
    else
      Logger.info "Iniciando http server"
      start_http_server
    end
  end

  def start_http_server do
    import Supervisor.Spec, warn: false
    children = [
      # Start the endpoint when the application starts
      supervisor(IascSubastas.Endpoint, []),
      # Start the Ecto repository
      worker(IascSubastas.Repo, []),
      worker(IascSubastas.SubastaWorker, [[name: {:global, :subasta_worker}]])
      # Here you could define other workers and supervisors as children
      # worker(IascSubastas.Worker, [arg1, arg2, arg3]),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: IascSubastas.Supervisor]
    Supervisor.start_link(children, opts)
  end

  def start_back_up_server(node_name) do
    receive do
    after 1000 ->
      Logger.info "Pingueando al server..."
      if(Node.ping(:"#{node_name}") == :pang) do
        Logger.info "El server está caido."
        start_http_server
      else
        start_back_up_server(node_name)
      end
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    IascSubastas.Endpoint.config_change(changed, removed)
    :ok
  end
end
