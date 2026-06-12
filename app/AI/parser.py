import fitz

def extract_pdf_text(file_path: str):

    doc = fitz.open(file_path)

    text = ""

    for page in doc:
        text += page.get_text()


    print("\n" + "="*50)
    print("PDF TEXT PREVIEW")
    print("="*50)
    print(text[:10000])
    print("="*50 + "\n")

    return text