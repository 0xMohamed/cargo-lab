import { Route, Router } from "@solidjs/router";

import Home from "./pages/Home";
import Layout from "./components/Layout";

import Cargo from "./pages/Cargo";
import About from "./pages/AIBrain";

function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/cargo" component={Cargo} />
      <Route path="/about" component={About} />
    </Router>
  );
}

export default App;
