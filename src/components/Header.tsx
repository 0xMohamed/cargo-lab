import styles from "../styles/Header.module.css";
import { A } from "@solidjs/router";

export default function Header() {
  return (
    <header class={styles.header}>
      <nav>
        <ul>
          <li>
            <A href="/" activeClass={styles.active} end>
              Home
            </A>
          </li>
          <li>
            <A href="/cargo" activeClass={styles.active}>
              Cargo
            </A>
          </li>
          <li>
            <A href="/about" activeClass={styles.active}>
              AI Brain
            </A>
          </li>
          {/* <li>
            <A href="/contacts" activeClass={styles.active}>
              Contacts
            </A>
          </li> */}
        </ul>
      </nav>
    </header>
  );
}
