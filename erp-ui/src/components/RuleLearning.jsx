import react, {useState} from "react";
import { learnRule } from "../services/api";

export default function RuleLearning() {
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("");

    const handleLearn = async() => {
      if (!keyword || !category){
        alert ("Fill all fields");
        return;
      }

        await learnRule({keyword, category});

        setKeyword("");
        setCategory("");
        alert("Rule Learned");
    };
    
    return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <h2 className="text-xl font-bold mb-4">Teach AI</h2>

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Keyword (salary, sales)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Category (operating_income etc.)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button
        onClick={handleLearn}
        className="w-full bg-orange-500 text-white p-2 rounded"
      >
        Learn
      </button>
    </div>
  );

}