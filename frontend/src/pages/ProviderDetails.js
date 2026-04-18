import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/providers/${id}`)
      .then(res => res.json())
      .then(data => setProvider(data));
  }, [id]);

  const updateStatus = async (status) => {
    await fetch(`http://localhost:5000/providers/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    navigate("/providers"); // back to list
  };

  if (!provider) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Provider Details</h2>

      <p><b>Email:</b> {provider.email}</p>
      <p><b>Company:</b> {provider.company_name}</p>
      <p><b>Contact Person:</b> {provider.contact_person}</p>
      <p><b>Phone:</b> {provider.phone_number}</p>
      <p><b>Industry:</b> {provider.industry}</p>
      <p><b>Website:</b> {provider.website}</p>
      <p><b>Address:</b> {provider.address}</p>
      <p><b>Province:</b> {provider.province}</p>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={() => updateStatus("accepted")}>
          Accept
        </button>

        <button onClick={() => updateStatus("rejected")}>
          Reject
        </button>
      </div>
    </div>
  );
}

export default ProviderDetails;