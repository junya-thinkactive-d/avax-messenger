import fs from 'fs'
import path from 'path'

const sourceDirectory = '../contract/contracts'
const targetDirectory = '../client/src/libs/viem/contractsConstABI'

// ディレクトリを作成する関数
function createDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true })
  }
}

// ソースディレクトリから全ての .sol ファイルのフルパスを取得する関数
function getAllSolFiles(directory) {
  const solFiles = []
  const files = fs.readdirSync(directory)
  for (const file of files) {
    const filePath = path.join(directory, file)
    const fileStat = fs.statSync(filePath)
    if (fileStat.isDirectory()) {
      solFiles.push(...getAllSolFiles(filePath)) // サブディレクトリ内の .sol ファイルを再帰的に取得
    } else if (path.extname(file) === '.sol') {
      solFiles.push(filePath)
    }
  }
  return solFiles
}

// ソースディレクトリから全ての .sol ファイルのフルパスを取得
const sourceFiles = getAllSolFiles(sourceDirectory)

sourceFiles.forEach((sourceFile) => {
  try {
    // コントラクト名を取得
    const contractName = path.basename(sourceFile, '.sol')

    // JSON ファイルのパスを作成
    const jsonFilePath = `../client/src/libs/hardhat/artifacts/contracts/${contractName}.sol/${contractName}.json` // JSON ファイルのフルパス

    // TypeScript ファイルのディレクトリパスを作成
    const tsDirPath = path.join(targetDirectory, path.dirname(sourceFile.replace(sourceDirectory, '')))
    createDirectory(tsDirPath) // ターゲットディレクトリが存在しない場合、ディレクトリを作成

    // TypeScript ファイルのパスを作成 (最初の文字を小文字に変更)
    const tsFileName = `${contractName.charAt(0).toLowerCase()}${contractName.slice(1)}ConstABI.ts`
    const tsFilePath = path.join(tsDirPath, tsFileName)

    // JSON ファイルを読み込み
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))

    // ABI 部分を抽出します
    const abi = jsonData.abi

    // TypeScript ファイルに書き込み
    const tsCode = `export const ${contractName.charAt(0).toLowerCase()}${contractName.slice(1)} = {
      address: '', // ここにアドレスを追加
      abi: ${JSON.stringify(abi, null, 2)}
    } as const;\n`

    fs.writeFileSync(tsFilePath, tsCode, 'utf8')

    console.log(`ABI を TypeScript ファイルに書き込みました: ${tsFilePath}`)
  } catch (error) {
    console.error('エラー:', error)
  }
})
