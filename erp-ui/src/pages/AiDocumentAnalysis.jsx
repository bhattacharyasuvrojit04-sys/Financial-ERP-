import { useState } from "react";
import Layout from "../components/Layout";
import { uploadFinancialDocument } from "../services/api";

export default function AiDocumentAnalysis() {

  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    try {

      const res = await uploadFinancialDocument(file);

      console.log("AI RESPONSE:", res);

      setResults(res);

    } catch (err) {

      console.error("UPLOAD ERROR:", err);

    } finally {

      setLoading(false);

    }
  };

  return (
    <Layout title="AI Financial Analysis">

      <div
        className="card"
        style={{
          padding: "25px",
          borderRadius: "12px"
        }}
      >

        {/* HEADER */}
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ marginBottom: "10px" }}>
            AI Financial Document Analysis
          </h2>

          <p style={{ color: "#666" }}>
            Upload annual reports, 10-K filings, investor presentations,
            or earnings call transcripts.
          </p>
        </div>

        {/* FILE INPUT */}
        <div
          style={{
            border: "2px dashed #d1d5db",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "20px",
            background: "#fafafa"
          }}
        >

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (
            <div style={{ marginTop: "15px" }}>
              <strong>Selected:</strong> {file.name}
            </div>
          )}

        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          {loading ? "Analyzing..." : "Analyze Financial Document"}
        </button>

        {/* LOADING UI */}
        {loading && (
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              background: "#f3f4f6",
              borderRadius: "10px"
            }}
          >

            <h3>AI Processing Pipeline</h3>

            <div style={{ marginTop: "15px" }}>
              ✅ Extracting text from PDF
            </div>

            <div style={{ marginTop: "10px" }}>
              ✅ Creating embeddings
            </div>

            <div style={{ marginTop: "10px" }}>
              🔄 AI financial analysis running
            </div>

            <div style={{ marginTop: "10px" }}>
              ⏳ Generating assumptions
            </div>

          </div>
        )}

        {/* RESULTS */}
        {results && (
          <div style={{ marginTop: "40px" }}>

            <h2 style={{ marginBottom: "20px" }}>
              AI Generated Assumptions
            </h2>

            {/* SAFE OBJECT.ENTRIES */}
            {Object.entries(results?.assumptions || {}).map(([key, value]) => (

              <div
                key={key}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  background: "white"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >

                  <div>

                    <h3 style={{ marginBottom: "10px" }}>
                      {formatName(key)}
                    </h3>

                    <div style={{ color: "#666" }}>
                      Suggested Value
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        marginTop: "5px"
                      }}
                    >
                      {value?.value ?? "N/A"}
                    </div>

                  </div>

                  <div
                    style={{
                      textAlign: "right"
                    }}
                  >

                    <div style={{ color: "#666" }}>
                      Confidence
                    </div>

                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#16a34a"
                      }}
                    >
                      {value?.confidence ?? 0}%
                    </div>

                  </div>

                </div>

                {/* ACTION BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px"
                  }}
                >

                  <button style={acceptBtn}>
                    Accept
                  </button>

                  <button style={rejectBtn}>
                    Reject
                  </button>

                  <button style={editBtn}>
                    Override
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </Layout>
  );
}

/* ================= BUTTON STYLES ================= */

const acceptBtn = {
  padding: "10px 18px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const rejectBtn = {
  padding: "10px 18px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const editBtn = {
  padding: "10px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

/* ================= HELPERS ================= */

function formatName(name) {

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

}