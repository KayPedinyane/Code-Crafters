
import { BrowserRouter , Routes ,Route } from "react-router-dom";
import ApplicantHome from "./pages/ApplicantHome";
import ProfilePage from "./pages/ProfilePage";
import ProviderOpportunityForm from "./ProviderOpportunityForm";


function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicantHome />} />
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/post-opportunity" element={<ProviderOpportunityForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;