import re

with open('src/pages/LaporanSayaPage.tsx', 'r') as f:
    content = f.read()

# Rename component
content = content.replace('const LaporanPage: React.FC = () => {', 'const LaporanSayaPage: React.FC = () => {')
content = content.replace('export default LaporanPage;', 'export default LaporanSayaPage;')

# Remove Admin Soal Management section
# It starts with {/* Admin Soal Management */} and ends with {isPusat && ( ... )}
# We can use regex to remove it
content = re.sub(r'\{\/\* Admin Soal Management \*\/\}.*?\{isPusat && \(\s*<div className="card">.*?</>\s*\)\s*\}\s*</div>\s*\)', '', content, flags=re.DOTALL)

# Remove Modal Tambah/Edit Soal
content = re.sub(r'\{\/\* Modal Tambah\/Edit Soal \*\/\}.*?</Modal>', '', content, flags=re.DOTALL)

with open('src/pages/LaporanSayaPage.tsx', 'w') as f:
    f.write(content)
