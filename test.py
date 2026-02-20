import fitz  # PyMuPDF

pdf_path = "./book.pdf"

doc = fitz.open(pdf_path)

# Extract pages 11–20 as a test (adjust if needed)
for page_number in range(10, 20):  # zero-indexed
    page = doc[page_number]
    text = page.get_text("text")
    print(f"\n--- Page {page_number+1} ---\n")
    print(text)
