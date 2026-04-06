
import { BrowserRouter , Routes ,Route } from "react-router-dom";
import ApplicantHome from "./pages/ApplicantHome";
import ProfilePage from "./pages/ProfilePage";


function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;