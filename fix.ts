import fs from 'fs';

const code = fs.readFileSync('src/hooks/useMediaImport.ts', 'utf8');
const lines = code.split('\n');

const fixedLines = lines.slice(0, 230);
const afterLines = lines.slice(256);

fixedLines.push('        }');
fixedLines.push('      } catch (e) {');
fixedLines.push('        if (e instanceof Error && e.message === "User cancelled") return;');
fixedLines.push('        console.warn("Probe failed", e);');
fixedLines.push('        // TODO: replace window.alert with app modal before public launch polish.');
fixedLines.push('        alert(');
fixedLines.push('          lang === "KR"');
fixedLines.push('            ? "이 영상의 정보를 읽을 수 없어 안전하게 처리할 수 없습니다. 다른 형식으로 변환하거나 더 짧은 클립을 사용해 주세요."');
fixedLines.push('            : lang === "EN"');
fixedLines.push('              ? "We could not read this video’s metadata safely. Try converting it to another format or using a shorter clip."');
fixedLines.push('              : "この動画の情報を安全に読み取れませんでした。別の形式に変換するか、短いクリップを使用してください。"');
fixedLines.push('        );');
fixedLines.push('        setUploadState("idle");');
fixedLines.push('        setIsPlaying(false);');
fixedLines.push('        setExtractionProgress({ current: 0, total: 0 });');
fixedLines.push('        setExtractionStartMs(null);');
fixedLines.push('        setExtractionStalled(false);');
fixedLines.push('        return;');
fixedLines.push('      }');

const newCode = fixedLines.concat(afterLines).join('\n');
fs.writeFileSync('src/hooks/useMediaImport.ts', newCode, 'utf8');
