// process.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

const TARGET_ROOT = path.join(__dirname, 'images'); // ← 여기에 MRI 폴더들 복사해두면 됨

// const TARGET_FOLDER = path.join(__dirname, 'images', '1-01-025-MRI-0254-250131' ); // ← 여기에 MRI 폴더들 복사해두면 됨

// 공백 제거 및 PNG 변환용 함수
function normalizeAndConvertImages(folderPath) {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg'));

    files.forEach((file) => {
        if (file.includes('_main')) {
            // main 이미지는 건너뜀
            return;
        }

        const originalPath = path.join(folderPath, file);
        const normalizedName = file.replace(/\s+/g, '_').replace('.jpg', '.png');
        const targetPath = path.join(folderPath, normalizedName);

        try {
            execSync(`convert "${originalPath}" -fuzz 10% -transparent white "${targetPath}"`);
            console.log(`✅ Converted: ${file} → ${normalizedName}`);
        } catch (err) {
            console.error(`❌ Failed to convert ${file}:`, err.message);
        }
    });
}


// meta.json 생성 함수
function createMetaJson(folderPath) {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));
    const baseImage = fs.readdirSync(folderPath).find(f => f.includes('_main') && f.endsWith('.jpg'));

    const masks = files
        .filter(f => !f.includes('_main'))
        .map(f => ({
            filename: f,
            label: f.split('_').slice(2).join(' ').replace('.png', ''),
            visible: true,
        }));

    const meta = {
        base: baseImage || null,
        masks,
    };

    const jsonPath = path.join(folderPath, 'meta.json');
    fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 2));
    console.log(`📝 meta.json created in ${folderPath}`);
}

// 루트 경로 순회
function run() {
    const caseFolders = fs.readdirSync(TARGET_ROOT)
        .map(f => path.join(TARGET_ROOT, f))
        .filter(f => fs.lstatSync(f).isDirectory());

    caseFolders.forEach(folder => {
        console.log(`\n📂 Processing: ${folder}`);
        normalizeAndConvertImages(folder);
        createMetaJson(folder);
    });

    console.log('\n🎉 All done!');
}

// // 단일 폴더 테스트 실행
// function run() {
//     console.log(`\n📂 Processing single folder: ${TARGET_FOLDER}`);
//     normalizeAndConvertImages(TARGET_FOLDER);
//     createMetaJson(TARGET_FOLDER);
//     console.log('\n🎉 Done!');
// }

run();
