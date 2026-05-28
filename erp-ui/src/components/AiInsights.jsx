import {useEffect, useState} from 'react';
import {getAiInsights} from '../services/api';

export default function AiInsights() {
    const [insights, setInsights] = useState(null);

    const loadInsights = async () => {
        try {
            const data = await getAiInsights();
            setInsights(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

      const getColor = (type) => {
    switch(type) {
      case "positive":
        return "#10b981";

      case "warning":
        return "#f59e0b";

      case "negative":
        return "#ef4444";

      default:
        return "#3b82f6";
    }
  };

  return (
    <div className="card" style={{
      padding: "20px"
    }}>

      <h2 style={{
        marginBottom: "20px"
      }}>
        AI Financial Analyst
      </h2>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}>

        {Array.isArray(insights) && insights.map((item, index) => (

          <div
            key={index}
            style={{
              borderLeft: `5px solid ${getColor(item.type)}`,
              background: "#fafafa",
              padding: "15px",
              borderRadius: "10px"
            }}
          >

            <div style={{
              fontWeight: "700",
              marginBottom: "8px"
            }}>
              {item.title}
            </div>

            <div style={{
              color: "#555"
            }}>
              {item.message}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}