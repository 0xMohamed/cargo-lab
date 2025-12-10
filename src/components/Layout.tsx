import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div class="page">
      <Header />
      {children}
    </div>
  );
}
