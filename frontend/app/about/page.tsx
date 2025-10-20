/* imports reusable components*/
import Header from '../header';
import NavBar from '../navbar';
import Footer from '../footer';

/* defining the about page*/
export default function About() {
  return (
    <div>
      <Header />
      <NavBar />
      <main style={{ padding: "2rem", display: "grid", gap: "1rem" }}>
        <h1><b><big>About</big></b></h1>
        <p>My name is Alysie Luong</p>
        <p>My student number is 21612368</p>
        <p>This is a video on explaining what features my website has and the codes used</p>
        <h2 style = {{ marginTop: "1rem"}}><b>Video 1 - Assignment 1</b></h2>
        
        {/* assignment 1 video*/}
        <video controls style={{ width: "100%", maxWidth: "600px" }}>
          <source src="/cse3cwassignment1video.mp4" type="video/mp4" />
        </video>

        <h2><b>Video 2 - Assignment 2</b></h2>
        {/* assignment 2 video*/}

        <h2><b>Feedback - Assignment 2</b></h2>
        <div style={{ display: "flex", flexDirection: "column",gap: "1rem", flexWrap: "wrap" }}>
          <p>feedback from 2 industry, 2 family and 2 friends</p>
          <img src="/escaperoomfeedback.png" style={{ width: "100%", maxWidth: "600px" }} /> 
          </div>      
        </main>
      <Footer />
    </div>
  );
}