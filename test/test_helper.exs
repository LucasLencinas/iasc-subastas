ExUnit.start

# Mix.Task.run "ecto.reset", ["--quiet"]
Ecto.Adapters.SQL.begin_test_transaction(IascSubastas.Repo)
