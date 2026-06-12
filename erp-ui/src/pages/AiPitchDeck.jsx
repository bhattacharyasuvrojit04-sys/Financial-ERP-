import {useState} from "react";
import Layout from "../components/Layout";
import {generatePitchDeck} from "../services/api";

export default function AiPitchDeck() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleGenerate = async () => {
        if(!file){
            alert("Please select a financial document");
            return;
        }

        setLoading(true);

        try {
            const res = await generatePitchDeck(file);

            setResult(res);
        }catch(err){console.error("PITCH DECK ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
    <Layout title="AI Pitch Deck Generator">

      <div className="card">

        <h2>AI Pitch Deck Generator</h2>

        <p>
          Upload Annual Report and generate
          Investment Banking Style Pitch Deck
        </p>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br />
        <br />

        <button onClick={handleGenerate}>
          Generate Pitch Deck
        </button>

        {loading && (

          <div style={{marginTop:"20px"}}>

            <p>📄 Reading Annual Report...</p>

            <p>🤖 Generating Investment Analysis...</p>

            <p>📊 Building Pitch Deck...</p>

          </div>

        )}

        {result && (

          <div style={{marginTop:"30px"}}>

            <h3>Pitch Deck Generated</h3>

            <p>{result.status}</p>

            <p>{result.ppt_file}</p>

          </div>

        )}

      </div>

    </Layout>
  );
}

