import Header from '../header';
import NavBar from '../navbar';
import Footer from '../footer';
import EscapeRoomBuilder from './components/escaperoombuilder';
import styles from './page.module.css';

export default function EscapeRoom() {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <NavBar />
      
      {/* Escape Room Builder Section */}
      <div className={styles.builderSection}>
        <EscapeRoomBuilder />
      </div>
      
      <Footer />
    </div>
  );
}