// ----- CONFIGURATION -----
const SPREADSHEET_ID = '1mAQNIo2QVfl4uNiuyVS2lAiSEnA40AkDrnIhoBRQGag';
const SHEET_NAME = 'Sheet1';
const TEMPLATE_ID = '115gn6bhafyTvAh1gniLiVEB80fG-F_Mz-XRvnbN2OtQ'; // Google Doc Template
const PDF_FOLDER_ID = '14JzQgv28umQScrRM0_pVEDK8FN_4kKi2';
const SIGNATURE_FOLDER_ID = '1YuCz2W0-DKm_Hya1-GG114mZzFJq4wSc'; // Thư mục lưu chữ ký
const COMMITMENT_TEMPLATE_ID = '1le-9TKmXUM3WLVoKDBJC0WaOODwyjDi1vKt3qgb_26w'; // Google Doc Cam kết

// --- NEW: Image Placeholder Configuration ---
// !!! ĐẢM BẢO GIÁ TRỊ NÀY KHỚP VỚI ALT TEXT DESCRIPTION TRONG DOC TEMPLATE !!!
const IMAGE_PLACEHOLDER_ALT_TEXT = "PHOTO_PLACEHOLDER";

// --- Feature Configuration ---
const SEND_CONFIRMATION_EMAIL = true;
const SEND_CERTIFICATE_EMAIL = true;
const BQL_NAME = "Ban Quản lý Khu du lịch Quốc gia Núi Bà Đen";

// --- Performance Optimization ---
const CACHE_DURATION = 300; // 5 minutes cache
const BATCH_SIZE = 5; // Reduced batch size for better stability
const MAX_MEMBERS_PER_REQUEST = 50; // Maximum members per request
const CERT_GENERATION_TIMEOUT = 300000; // 5 minutes timeout
const BATCH_DELAY = 300; // 300ms delay between batches

// --- Expected Column Names ---
const COL_TIMESTAMP = 'Timestamp';         // A
const COL_LEADER_NAME = 'LeaderName';      // B
const COL_PHONE_NUMBER = 'PhoneNumber';    // C
const COL_ADDRESS = 'Address';           // D
const COL_GROUP_SIZE = 'GroupSize';        // E
const COL_EMAIL = 'Email';               // F
const COL_CLIMB_DATE = 'ClimbDate';        // G
const COL_CLIMB_TIME = 'ClimbTime';        // H
const COL_SAFETY_COMMIT = 'SafetyCommit';  // I
const COL_MEMBER_LIST = 'MemberList';      // J
const COL_STATUS = 'Status';             // K
const COL_CERT_LINKS = 'CertificateLinks'; // L
const COL_BIRTHDAY = 'Birthday';
const COL_CCCD = 'CCCD';
const COL_COMMITMENT_PDF = 'CommitmentPDFLink';
const COL_SIGNATURE_IMAGE = 'SignatureImage';

// --- Cache Management ---
let _sheetCache = null;
let _columnCache = null;
let _lastCacheTime = 0;

function getCachedSheet() {
  const now = Date.now();
  if (!_sheetCache || (now - _lastCacheTime) > (CACHE_DURATION * 1000)) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    _sheetCache = ss.getSheetByName(SHEET_NAME);
    _lastCacheTime = now;
  }
  return _sheetCache;
}

function getCachedColumnIndices(sheet) {
  if (!_columnCache) {
    _columnCache = getColumnIndices(sheet);
  }
  return _columnCache;
}

// ----- CORS PREFLIGHT HANDLER -----
function doOptions(e) {
  Logger.log("--- Handling OPTIONS request (CORS Preflight) ---");
  try {
    return ContentService.createTextOutput()
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    Logger.log(`!!! ERROR handling OPTIONS request: ${error} !!!`);
    return ContentService.createTextOutput("Error handling OPTIONS request").setMimeType(ContentService.MimeType.TEXT);
  }
}

// ----- MAIN ROUTING FUNCTIONS -----

function doPost(e) {
  let requestData, action = '';
  try {
    requestData = JSON.parse(e.postData.contents);
    action = requestData.action || '';
    Logger.log(`doPost received action: "${action}", data keys: ${Object.keys(requestData).join(', ')}`);

    switch (action) {
      case 'register':
        return handleRegistration(requestData);
      case 'generateCertificatesWithPhotos':
        return handleGenerateCertificatesWithPhotos(requestData);
      default:
        Logger.log(`Invalid action in doPost: ${action}`);
        return createJsonResponse({ success: false, message: 'Hành động POST không hợp lệ.' });
    }
  } catch (error) {
    Logger.log(`!!! ERROR in doPost (Action: ${action}): ${error.message}\nInput Data: ${JSON.stringify(requestData)}\nStack: ${error.stack}`);
    return createJsonResponse({ success: false, message: `Lỗi máy chủ khi xử lý POST: ${error.message}` });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    Logger.log(`doGet received action: ${action}, parameters: ${JSON.stringify(e.parameter)}`);

    switch (action) {
      case 'getMembersByPhone':
        const phoneForMembers = String(e.parameter.phone || '').trim();
        return handleGetMembers(phoneForMembers);

      // Đã loại bỏ action 'getCertificate' (legacy) theo yêu cầu trước đó
      default:
        Logger.log(`No specific GET action matched (${action}). Serving HTML.`);
        return HtmlService.createHtmlOutputFromFile('index.html')
               .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  } catch (error) {
    Logger.log(`!!! ERROR in doGet: ${error.message}\nStack: ${error.stack}`);
    return createJsonResponse({ success: false, message: `Lỗi máy chủ khi xử lý GET.` });
  }
}


// ----- ACTION HANDLERS -----

function handleRegistration(requestData) {
    Logger.log(`handleRegistration received data: ${JSON.stringify(requestData)}`);
    
    // Fast validation
    const leaderName = String(requestData.leaderName || '').trim();
    const phoneNumber = String(requestData.phoneNumber || '').trim();
    const address = String(requestData.address || '').trim();
    const groupSizeStr = String(requestData.groupSize || '0').trim();
    const groupSize = parseInt(groupSizeStr, 10) || 0;
    const email = String(requestData.email || '').trim().toLowerCase();
    const climbDate = String(requestData.climbDate || '');
    const climbTime = String(requestData.climbTime || '');
    const safetyCommit = requestData.safetyCommit === true || String(requestData.safetyCommit).toLowerCase() === 'on' || String(requestData.safetyCommit).toLowerCase() === 'true';
    const memberList = String(requestData.memberList || '').trim();
    const birthday = String(requestData.birthday || '').trim();
    const signatureData = String(requestData.signatureData || '').trim();
    const cccd = String(requestData.cccd || '').trim();

    // Tự động thêm tên người trưởng nhóm vào danh sách thành viên nếu chưa có
    let processedMemberList = memberList;
    if (leaderName && leaderName.trim()) {
        const leaderNameTrimmed = leaderName.trim();
        const memberArray = memberList ? memberList.split('\n').map(name => name.trim()).filter(Boolean) : [];
        
        // Kiểm tra xem tên người trưởng đã có trong danh sách chưa
        const leaderExists = memberArray.some(member => 
            member.toLowerCase() === leaderNameTrimmed.toLowerCase()
        );
        
        if (!leaderExists) {
            // Thêm tên người trưởng vào đầu danh sách
            memberArray.unshift(leaderNameTrimmed);
            processedMemberList = memberArray.join('\n');
            Logger.log(`Auto-added leader "${leaderNameTrimmed}" to member list`);
        } else {
            Logger.log(`Leader "${leaderNameTrimmed}" already exists in member list`);
        }
    }

    if (!leaderName || !phoneNumber || !address || !email || !groupSize || groupSize <= 0 || !safetyCommit ) {
        Logger.log(`Reg Validation Failed: leader=${leaderName}, phone=${phoneNumber}, address=${address}, email=${email}, size=${groupSize}, commit=${safetyCommit}`);
        return createJsonResponse({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }
    if (!/^[0-9]{10,11}$/.test(phoneNumber)) return createJsonResponse({ success: false, message: 'Số điện thoại không hợp lệ.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return createJsonResponse({ success: false, message: 'Địa chỉ email không hợp lệ.' });

    Logger.log(`Extracted Reg Data OK: leaderName=${leaderName}, phoneNumber=${phoneNumber}, email=${email}`);

    // Use cached sheet for better performance
    const sheet = getCachedSheet();
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

    const cols = getCachedColumnIndices(sheet);
    if (!cols) return createJsonResponse({ success: false, message: 'Lỗi cấu hình cột sheet.' });

    const timestamp = new Date();
    const status = 'Registered';
    const safetyCommitValue = safetyCommit ? 'Đã cam kết' : 'Chưa cam kết';

    let signatureFileUrl = '';
    if (signatureData && signatureData.startsWith('data:image')) {
      try {
        const base64Data = signatureData.split(',')[1];
        const contentType = signatureData.split(';')[0].split(':')[1];
        const decodedBytes = Utilities.base64Decode(base64Data);

        // Lấy ngày đăng ký (timestamp) theo định dạng ddMMyyyy
        const regDate = new Date();
        const dd = String(regDate.getDate()).padStart(2, '0');
        const mm = String(regDate.getMonth() + 1).padStart(2, '0');
        const yyyy = regDate.getFullYear();
        const dateStr = `${dd}${mm}${yyyy}`;

        // Tạo tên file: ddMMyyyy-Tên đăng ký_signature.png
        const safeName = leaderName.replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '_');
        const fileName = `${dateStr}-${safeName}_signature.png`;

        const blob = Utilities.newBlob(decodedBytes, contentType, fileName);
        const folder = DriveApp.getFolderById(SIGNATURE_FOLDER_ID);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        signatureFileUrl = file.getUrl();
      } catch (e) {
        Logger.log('Lỗi lưu chữ ký: ' + e);
      }
    }

    let commitmentPDFUrl = '';
    try {
      const regDate = new Date();
      const dd = String(regDate.getDate()).padStart(2, '0');
      const mm = String(regDate.getMonth() + 1).padStart(2, '0');
      const yyyy = regDate.getFullYear();
      const dateStr = `${dd}${mm}${yyyy}`;
      const safeName = leaderName.replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '_');
      const fileName = `${dateStr}-${safeName}_commitment`;

      const folder = DriveApp.getFolderById(SIGNATURE_FOLDER_ID); // Hoặc folder riêng cho PDF cam kết
      commitmentPDFUrl = createCommitmentPDF({
        leaderName, birthday, cccd, address, phoneNumber, email, groupSize, climbDate, climbTime
      }, signatureData, COMMITMENT_TEMPLATE_ID, folder, fileName);
    } catch (e) {
      Logger.log('Lỗi tạo PDF cam kết: ' + e);
    }

    const newRow = createRowArray(cols, {
        [COL_TIMESTAMP]: timestamp, [COL_LEADER_NAME]: leaderName,
        [COL_PHONE_NUMBER]: "'" + phoneNumber, [COL_ADDRESS]: address,
        [COL_GROUP_SIZE]: groupSize, [COL_EMAIL]: email,
        [COL_CLIMB_DATE]: climbDate, [COL_CLIMB_TIME]: climbTime,
        [COL_BIRTHDAY]: birthday,
        [COL_CCCD]: cccd,
        [COL_SIGNATURE_IMAGE]: signatureFileUrl,
        [COL_SAFETY_COMMIT]: safetyCommitValue, [COL_MEMBER_LIST]: processedMemberList,
        [COL_STATUS]: status, [COL_CERT_LINKS]: '',
        [COL_COMMITMENT_PDF]: commitmentPDFUrl
    });

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    Logger.log(`Registration saved for ${leaderName} (${phoneNumber})`);

    if (SEND_CONFIRMATION_EMAIL && email) {
      try {
        const subject = `Xác nhận đăng ký leo núi Bà Đen - ${leaderName || 'Khách'}`;
        const logData = { leaderName, phoneNumber, email, address, groupSize, climbDate, climbTime, safetyCommitValue, BQL_NAME };
        Logger.log(`DEBUG (Confirmation Email Data): ${JSON.stringify(logData)}`);
        for(const key in logData) { if (logData[key] === undefined || logData[key] === null) Logger.log(`WARNING: Conf Email - Var '${key}' is undef/null.`); }

        let htmlBody = `<p>Chào ${escapeHtml(leaderName || 'Bạn')},</p>`;
        htmlBody += `<p>${escapeHtml(BQL_NAME || 'BQL')} xác nhận bạn đã đăng ký thành công chuyến leo núi Bà Đen với thông tin:</p><ul>`;
        htmlBody += `<li>Số điện thoại: ${escapeHtml(phoneNumber || 'N/A')}</li>`;
        htmlBody += `<li>Email: ${escapeHtml(email || 'N/A')}</li>`;
        htmlBody += `<li>Địa chỉ: ${escapeHtml(address || 'N/A')}</li>`;
        htmlBody += `<li>Số lượng thành viên: ${escapeHtml(String(groupSize || 0))}</li>`;
        htmlBody += `<li>Ngày leo: ${climbDate ? escapeHtml(climbDate) + (climbTime ? ` lúc ${escapeHtml(climbTime)}` : '') : 'Chưa cung cấp'}</li>`;
        htmlBody += `<li>Cam kết an toàn: ${escapeHtml(safetyCommitValue || 'N/A')}</li></ul>`;
        htmlBody += `<p>Vui lòng chuẩn bị kỹ lưỡng theo hướng dẫn và quy định.</p><p>Chúc bạn có chuyến đi an toàn!</p>`;
        htmlBody += `<p>Trân trọng,<br>${escapeHtml(BQL_NAME || 'Ban Quản Lý')}.</p>`;

        MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody });
        Logger.log(`Sent confirmation email to ${email}`);
      } catch (mailError) { Logger.log(`!!! ERROR sending confirmation email: ${mailError}`); }
    } else if (SEND_CONFIRMATION_EMAIL && !email) { Logger.log("Reg success, no email provided."); }

    return createJsonResponse({ success: true, message: 'Đăng ký thành công!' + (SEND_CONFIRMATION_EMAIL ? ' Vui lòng kiểm tra email.' : '') });
}


function handleGenerateCertificatesWithPhotos(requestData) {
    const startTime = Date.now();
    Logger.log(`handleGenerateCertificatesWithPhotos received data: ${JSON.stringify(requestData)}`);
    const phoneNumber = String(requestData.phone || '').trim();
    const selectedMembers = requestData.members;

    if (!phoneNumber || !/^[0-9]{10,11}$/.test(phoneNumber)) return createJsonResponse({ success: false, message: 'Số điện thoại không hợp lệ.' });
    if (!selectedMembers || !Array.isArray(selectedMembers) || selectedMembers.length === 0) return createJsonResponse({ success: false, message: "Không có thành viên nào được chọn." });
    
    // Check member limit
    if (selectedMembers.length > MAX_MEMBERS_PER_REQUEST) {
        return createJsonResponse({ 
            success: false, 
            message: `Quá nhiều thành viên (${selectedMembers.length}). Tối đa ${MAX_MEMBERS_PER_REQUEST} thành viên mỗi lần.` 
        });
    }

    // Use cached sheet for better performance
    const sheet = getCachedSheet();
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

    const regDetails = findRegistrationDetails(sheet, phoneNumber);
    if (!regDetails) return createJsonResponse({ success: false, message: `Không tìm thấy đăng ký gốc cho SĐT ${phoneNumber}.` });

    const { rowIndex, leaderName = 'Bạn', userEmail = null, climbDate = new Date(), climbTime = '' } = regDetails;
    Logger.log(`Found registration: Row=${rowIndex}, Leader=${leaderName}, Email=${userEmail}, Date=${climbDate}`);

    let destFolder;
    try { destFolder = DriveApp.getFolderById(PDF_FOLDER_ID); } catch (e) { Logger.log(`WARN: PDF Folder ID error. Using root. ${e}`); destFolder = DriveApp.getRootFolder(); }

    const pdfLinks = [], errors = [];
    const generationDate = new Date();
    const registrationTime = regDetails.registrationTimestamp instanceof Date ? regDetails.registrationTimestamp : null;
    const baseDateForDisplay = registrationTime || climbDate;
    const dateStr = Utilities.formatDate(baseDateForDisplay, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    const durationMs = registrationTime ? (generationDate.getTime() - registrationTime.getTime()) : null;
    const durationString = durationMs !== null ? formatDurationVi(durationMs) : '';

    Logger.log(`Generating certs for ${selectedMembers.length} members in batches of ${BATCH_SIZE}...`);
    
    // Process in batches for better performance
    for (let i = 0; i < selectedMembers.length; i += BATCH_SIZE) {
        // Check timeout
        if (Date.now() - startTime > CERT_GENERATION_TIMEOUT) {
            Logger.log(`Certificate generation timeout after ${Math.round((Date.now() - startTime)/1000)}s`);
            return createJsonResponse({ 
                success: false, 
                message: `Tạo chứng nhận bị gián đoạn do thời gian chờ. Đã tạo ${pdfLinks.length}/${selectedMembers.length} chứng nhận.`,
                pdfLinks: pdfLinks,
                partialSuccess: true
            });
        }
        
        const batch = selectedMembers.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(selectedMembers.length / BATCH_SIZE);
        
        Logger.log(`Processing batch ${batchNumber}/${totalBatches} with ${batch.length} members...`);
        
        batch.forEach((memberInfo, batchIndex) => {
            if (!memberInfo || typeof memberInfo !== 'object') { errors.push("Bad member data."); return; }
            const memberName = String(memberInfo.name || '').trim();
            const photoBase64 = memberInfo.photoData;
            if (!memberName) { errors.push("Member name missing."); return; }

            try {
                const safeName = memberName.replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '_') || 'Member';
                const fileNameBase = `ChungNhan_${safeName}_${Utilities.formatDate(generationDate, 'UTC', 'yyyyMMddHHmmss')}`;
                const pdfUrl = createCertificate(memberName, dateStr, String(climbTime || ''), durationString, photoBase64, TEMPLATE_ID, destFolder, fileNameBase);
                if (pdfUrl) {
                    pdfLinks.push({ name: memberName, url: pdfUrl });
                    Logger.log(`Success: PDF for ${memberName} (${pdfLinks.length}/${selectedMembers.length})`);
                } else { throw new Error(`createCert returned null for ${memberName}`); }
            } catch (certError) {
                Logger.log(`!!! ERROR creating PDF for "${memberName}": ${certError}`);
                errors.push(`Lỗi tạo PDF cho ${memberName}.`);
            }
        });
        
        // Delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < selectedMembers.length) {
            Logger.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
            Utilities.sleep(BATCH_DELAY);
        }
    }
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    Logger.log(`Finished PDF gen in ${totalTime}s. Success: ${pdfLinks.length}, Errors: ${errors.length}`);

    let overallSuccess = pdfLinks.length > 0;
    let statusMsg = `Generated ${pdfLinks.length}/${selectedMembers.length} certificates`;
    if (errors.length > 0) statusMsg += ` (${errors.length} errors)`;
    statusMsg += ` in ${totalTime}s`;

    try {
        const cols = getCachedColumnIndices(sheet);
        if(cols) {
            if (cols[COL_STATUS]) sheet.getRange(rowIndex, cols[COL_STATUS]).setValue(statusMsg);
            if (cols[COL_CERT_LINKS]) sheet.getRange(rowIndex, cols[COL_CERT_LINKS]).setValue(pdfLinks.length > 0 ? JSON.stringify(pdfLinks) : '');
            SpreadsheetApp.flush();
            Logger.log(`Updated Sheet: Row ${rowIndex}, Status=${statusMsg}`);
        }
    } catch (e) { Logger.log(`!!! Error updating sheet row ${rowIndex}: ${e}`); }

    let emailSent = false;
    if (SEND_CERTIFICATE_EMAIL && userEmail && pdfLinks.length > 0) {
        try {
            const subject = `Chứng nhận chinh phục Núi Bà Đen - ${pdfLinks.length} thành viên`;
            const emailLogData = { leaderName, userEmail, BQL_NAME, pdfLinksCount: pdfLinks.length, errorsCount: errors.length, totalTime };
            Logger.log(`DEBUG (Cert Email Data): ${JSON.stringify(emailLogData)}`);

            let htmlBody = `<p>Chào ${escapeHtml(leaderName || 'Bạn')},</p>`;
            htmlBody += `<p>Chúc mừng bạn và đoàn đã chinh phục thành công đỉnh Núi Bà Đen!</p>`;
            // BỎ thống kê thời gian tạo chứng nhận
            // htmlBody += `<p><strong>Thống kê:</strong> Đã tạo ${pdfLinks.length}/${selectedMembers.length} chứng nhận trong ${totalTime} giây.</p>`;
            htmlBody += `<p>Link tải chứng nhận điện tử cho các thành viên:</p><ul>`;
            pdfLinks.forEach(linkInfo => {
                const name = linkInfo?.name ? escapeHtml(linkInfo.name) : '[N/A]';
                const url = linkInfo?.url ? escapeHtml(linkInfo.url) : '#';
                htmlBody += `<li>${name}: <a href="${url}" target="_blank" rel="noopener noreferrer">Tải chứng nhận</a></li>`;
            });
            htmlBody += `</ul>`;
            if (errors.length > 0) htmlBody += `<p style="color:red;">⚠️ Lưu ý: Có ${errors.length} lỗi xảy ra khi tạo chứng nhận.</p>`;
            htmlBody += `<p>Xin cảm ơn & hẹn gặp lại!</p><p>Trân trọng,<br>${escapeHtml(BQL_NAME || 'BQL')}.</p>`;

            MailApp.sendEmail({ to: userEmail, subject: subject, htmlBody: htmlBody });
            emailSent = true;
            Logger.log(`Sent cert links email to ${userEmail}.`);
        } catch (mailError) { Logger.log(`!!! ERROR sending cert email: ${mailError}`); }
    } else { Logger.log(`Skipped cert email: Send=${SEND_CERTIFICATE_EMAIL}, Email=${userEmail}, Links=${pdfLinks.length}`); }

    let userRespMsg = `✅ Đã tạo ${pdfLinks.length}/${selectedMembers.length} chứng nhận trong ${totalTime}s.`;
    if (errors.length > 0) userRespMsg = `⚠️ Hoàn thành ${pdfLinks.length}/${selectedMembers.length} chứng nhận (${errors.length} lỗi) trong ${totalTime}s.`;
    if (!overallSuccess && errors.length > 0) userRespMsg = `❌ Tạo chứng nhận thất bại (${errors.length} lỗi).`;
    if (emailSent) userRespMsg += " 📧 Email đã gửi.";

    return createJsonResponse({ 
        success: overallSuccess && errors.length === 0, 
        message: userRespMsg, 
        pdfLinks: pdfLinks,
        stats: {
            total: selectedMembers.length,
            success: pdfLinks.length,
            errors: errors.length,
            timeSeconds: totalTime
        }
    });
}


function handleGetMembers(phoneNumber) {
    Logger.log(`handleGetMembers for phone: ${phoneNumber}`);
    try {
        if (!phoneNumber || !/^[0-9]{10,11}$/.test(phoneNumber)) return createJsonResponse({ success: false, message: 'SĐT không hợp lệ.' });
        
        // Use cached sheet for better performance
        const sheet = getCachedSheet();
        if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);
        
        const cols = getCachedColumnIndices(sheet);
        if (!cols || !cols[COL_PHONE_NUMBER] || !cols[COL_MEMBER_LIST]) return createJsonResponse({ success: false, message: 'Lỗi cấu hình cột (getMembers).' });

        const phoneCol = cols[COL_PHONE_NUMBER];
        const memberCol = cols[COL_MEMBER_LIST];
        const lastRow = sheet.getLastRow();
        const phoneData = sheet.getRange(2, phoneCol, lastRow - 1, 1).getValues();
        const memberData = sheet.getRange(2, memberCol, lastRow - 1, 1).getValues();
        
        let members = [];
        let found = false;
        
        // Search from bottom to top for most recent registration
        for (let i = phoneData.length - 1; i >= 0; i--) {
            const sheetPhone = String(phoneData[i][0] || '').replace(/^'/, '').trim();
            if (sheetPhone === phoneNumber) {
                const listStr = String(memberData[i][0] || '').trim();
                if (listStr) members = listStr.split('\n').map(name => name.trim()).filter(Boolean);
                found = true;
                Logger.log(`Found members for ${phoneNumber} at row ${i + 2}. Count: ${members.length}`);
                break;
            }
        }
        
        if (!found) return createJsonResponse({ success: false, message: `Không tìm thấy đăng ký cho SĐT ${phoneNumber}.` });
        return createJsonResponse({ success: true, members: members });
    } catch (error) {
        Logger.log(`!!! ERROR in handleGetMembers: ${error}`);
        return createJsonResponse({ success: false, message: `Lỗi server khi lấy members.` });
    }
}


// ----- HELPER FUNCTIONS -----

// Optimized certificate creation with better error handling
function createCertificate(name, dateString, timeString, durationString, photoBase64, templateId, destinationFolder, outputFileNameBase) {
  let tempCopyFile = null, copyDoc = null;
  const placeholderAltText = IMAGE_PLACEHOLDER_ALT_TEXT; // Alt text của hình ảnh placeholder

  try {
    // Sao chép template
    const templateFile = DriveApp.getFileById(templateId);
    const tempCopyName = `TEMP_${outputFileNameBase}_${Utilities.getUuid()}`;
    tempCopyFile = templateFile.makeCopy(tempCopyName, destinationFolder);
    copyDoc = DocumentApp.openById(tempCopyFile.getId());

    // Thay thế hình ảnh nếu có dữ liệu Base64
    let imageReplaced = false;
    if (photoBase64 && photoBase64.startsWith('data:image')) {
      // Giải mã Base64 thành Blob
      const base64Data = photoBase64.split(',')[1];
      const contentType = photoBase64.split(';')[0].split(':')[1];
      const decodedBytes = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedBytes, contentType, `${name}_photo`);

      // Lấy body của tài liệu
      const body = copyDoc.getBody();
      const inlineImages = body.getImages();

      // Tìm và thay thế INLINE_IMAGE
      for (let i = 0; i < inlineImages.length; i++) {
        const img = inlineImages[i];
        const altDesc = img.getAltDescription();
        if (altDesc === placeholderAltText) {
          const parent = img.getParent();
          const indexInParent = parent.getChildIndex(img);
          const placeholderWidth = img.getWidth();
          const placeholderHeight = img.getHeight();
          // Chèn ảnh mới và xóa ảnh cũ
          const newImage = parent.insertInlineImage(indexInParent, blob);
          newImage.setWidth(placeholderWidth);
          newImage.setHeight(placeholderHeight);
          img.removeFromParent();
          imageReplaced = true;
          break;
        }
      }

      if (!imageReplaced) {
        Logger.log(`Không tìm thấy placeholder "${placeholderAltText}" trong tài liệu.`);
      }
    } else {
      Logger.log(`Không có ảnh hoặc định dạng Base64 không hợp lệ.`);
    }

    // Thay thế văn bản
    const body = copyDoc.getBody();
    body.replaceText('{{FullName}}', name || 'N/A');
    body.replaceText('{{Date}}', dateString || 'N/A');
    // New placeholders for climb time
    body.replaceText('{{ClimbTime}}', timeString || 'N/A');
    body.replaceText('{{Time}}', timeString || 'N/A');
    body.replaceText('{{DateTime}}', (dateString && timeString) ? `${dateString} ${timeString}` : (dateString || 'N/A'));
    // Duration placeholders
    body.replaceText('{{Duration}}', durationString || '');
    body.replaceText('{{ElapsedTime}}', durationString || '');

    // Lưu và xuất PDF
    copyDoc.saveAndClose();
    copyDoc = null;
    const pdfBlob = tempCopyFile.getAs(MimeType.PDF).setName(outputFileNameBase + '.pdf');
    const pdfFile = destinationFolder.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return pdfFile.getUrl();

  } catch (error) {
    Logger.log(`Lỗi khi tạo chứng chỉ: ${error}`);
    return null;
  } finally {
    if (copyDoc) {
      try {
        copyDoc.saveAndClose();
      } catch (e) {}
    }
    if (tempCopyFile) {
      try {
        if (!tempCopyFile.isTrashed()) tempCopyFile.setTrashed(true);
      } catch (e) {
        Logger.log(`Lỗi khi xóa file tạm: ${e}`);
      }
    }
  }
}

function createCommitmentPDF(data, signatureData, templateId, destinationFolder, outputFileNameBase) {
  let tempCopyFile = null, copyDoc = null;
  try {
    const templateFile = DriveApp.getFileById(templateId);
    const tempCopyName = `TEMP_${outputFileNameBase}_${Utilities.getUuid()}`;
    tempCopyFile = templateFile.makeCopy(tempCopyName, destinationFolder);
    copyDoc = DocumentApp.openById(tempCopyFile.getId());

    const body = copyDoc.getBody();
    body.replaceText('{{FullName}}', data.leaderName || 'N/A');
    body.replaceText('{{Birthday}}', formatDateDMY(data.birthday) || 'N/A');
    body.replaceText('{{CCCD}}', data.cccd || 'N/A');
    body.replaceText('{{Address}}', data.address || 'N/A');
    body.replaceText('{{PhoneNumber}}', data.phoneNumber || 'N/A');
    body.replaceText('{{Email}}', data.email || 'N/A');
    body.replaceText('{{GroupSize}}', data.groupSize || 'N/A');
    body.replaceText('{{ClimbDate}}', formatDateDMY(data.climbDate));
    body.replaceText('{{ClimbTime}}', data.climbTime || 'N/A');

    const now = new Date();
    const signDay = String(now.getDate()).padStart(2, '0');
    const signMonth = String(now.getMonth() + 1).padStart(2, '0');
    const signYear = now.getFullYear();
    const signDate = `${signDay}/${signMonth}/${signYear}`;

    body.replaceText('{{SignDay}}', signDay);
    body.replaceText('{{SignMonth}}', signMonth);
    body.replaceText('{{SignYear}}', signYear);
    body.replaceText('{{SignDate}}', signDate);

    // Chèn ảnh chữ ký
    if (signatureData && signatureData.startsWith('data:image')) {
      const base64Data = signatureData.split(',')[1];
      const contentType = signatureData.split(';')[0].split(':')[1];
      const decodedBytes = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedBytes, contentType, `${data.leaderName}_signature.png`);
      const images = body.getImages();
      let replaced = false;
      for (let i = 0; i < images.length; i++) {
        if (images[i].getAltDescription() === 'SIGNATURE_PLACEHOLDER') {
          const parent = images[i].getParent();
          const idx = parent.getChildIndex(images[i]);
          const width = images[i].getWidth();
          const height = images[i].getHeight();
          const newImg = parent.insertInlineImage(idx, blob);
          newImg.setWidth(width);
          newImg.setHeight(height);
          images[i].removeFromParent();
          replaced = true;
          break;
        }
      }
      if (!replaced) Logger.log('Không tìm thấy placeholder chữ ký trong template');
    }

    copyDoc.saveAndClose();
    copyDoc = null;
    const pdfBlob = tempCopyFile.getAs(MimeType.PDF).setName(outputFileNameBase + '.pdf');
    const pdfFile = destinationFolder.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return pdfFile.getUrl();

  } catch (error) {
    Logger.log('Lỗi tạo PDF cam kết: ' + error);
    return '';
  } finally {
    if (copyDoc) try { copyDoc.saveAndClose(); } catch (e) {}
    if (tempCopyFile) try { if (!tempCopyFile.isTrashed()) tempCopyFile.setTrashed(true); } catch (e) {}
  }
}

function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Format duration in Vietnamese, e.g., 4 giờ 32 phút 10 giây
function formatDurationVi(durationMs) {
  try {
    if (typeof durationMs !== 'number' || !isFinite(durationMs) || durationMs < 0) return '';
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) parts.push(hours + ' Giờ');
    if (minutes > 0) parts.push(minutes + ' Phút');
    if (hours === 0 && minutes === 0) parts.push(seconds + ' Giây');
    return parts.join(' ');
  } catch (e) { return ''; }
}

// --- createJsonResponse (Giữ nguyên) ---
function createJsonResponse(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }

// --- getColumnIndexByName (Giữ nguyên) ---
function getColumnIndexByName(sheet, columnName) {
   if (!columnName) return -1;
   const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
   const lowerCaseColName = columnName.toLowerCase();
   for (let i = 0; i < headers.length; i++) { if (headers[i] && String(headers[i]).toLowerCase() === lowerCaseColName) return i + 1; }
   Logger.log(`Column "${columnName}" not found.`); return -1;
 }

// --- escapeHtml (Giữ nguyên - Phiên bản đúng) ---
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        try {
            unsafe = String(unsafe);
        } catch (e) {
            console.warn("Không thể chuyển đổi giá trị thành chuỗi để escape:", unsafe);
            return '';
        }
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// --- decodeBase64Image (Giữ nguyên) ---
function decodeBase64Image(base64String) {
   const match = base64String.match(/^data:(image\/.+);base64,(.+)$/);
   if (!match) throw new Error("Invalid Base64.");
   return { contentType: match[1], decodedBytes: Utilities.base64Decode(match[2]) };
 }

// --- findRegistrationDetails (Giữ nguyên) ---
function findRegistrationDetails(sheet, phoneNumber) {
     const cols = getColumnIndices(sheet);
     if (!cols || !cols[COL_PHONE_NUMBER] || !cols[COL_LEADER_NAME] || !cols[COL_EMAIL] || !cols[COL_MEMBER_LIST] || !cols[COL_CLIMB_DATE]) { Logger.log("findRegDetails: Missing cols."); return null; }
     const phoneCol = cols[COL_PHONE_NUMBER], leaderNameCol = cols[COL_LEADER_NAME], emailCol = cols[COL_EMAIL], memberListCol = cols[COL_MEMBER_LIST], climbDateCol = cols[COL_CLIMB_DATE], climbTimeCol = cols[COL_CLIMB_TIME], timestampCol = cols[COL_TIMESTAMP];
     const data = sheet.getDataRange().getValues();
     for (let i = data.length - 1; i >= 1; i--) {
       const sheetPhone = String(data[i][phoneCol - 1] || '').trim();
       if (sheetPhone === phoneNumber) {
         const climbDateValue = data[i][climbDateCol - 1];
         const climbTimeValue = climbTimeCol ? String(data[i][climbTimeCol - 1] || '').trim() : '';
         const registrationTsValue = timestampCol ? data[i][timestampCol - 1] : null;
         const leaderNameValue = String(data[i][leaderNameCol - 1] || 'Bạn').trim();
         const userEmailValue = String(data[i][emailCol - 1] || '').trim().toLowerCase();
         const memberListStrValue = String(data[i][memberListCol - 1] || '').trim();
         Logger.log(`DEBUG findRegDetails: Found Row ${i+1}. Leader=${leaderNameValue}, Email=${userEmailValue}, Date=${climbDateValue}`);
         return {
           rowIndex: i + 1, leaderName: leaderNameValue, userEmail: userEmailValue || null,
           memberListString: memberListStrValue,
           climbDate: climbDateValue instanceof Date ? climbDateValue : (climbDateValue ? new Date(climbDateValue) : new Date()),
           climbTime: climbTimeValue,
           registrationTimestamp: registrationTsValue instanceof Date ? registrationTsValue : (registrationTsValue ? new Date(registrationTsValue) : null)
         };
       }
     }
     Logger.log(`findRegDetails: Phone ${phoneNumber} not found.`); return null;
 }

// --- getColumnIndices (Giữ nguyên) ---
function getColumnIndices(sheet) {
     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
     const indices = {};
     const expectedCols = [
       COL_TIMESTAMP, COL_LEADER_NAME, COL_PHONE_NUMBER, COL_ADDRESS, COL_GROUP_SIZE, COL_EMAIL,
       COL_CLIMB_DATE, COL_CLIMB_TIME, COL_SAFETY_COMMIT, COL_MEMBER_LIST, COL_STATUS, COL_CERT_LINKS,
       COL_BIRTHDAY, COL_CCCD, COL_SIGNATURE_IMAGE, COL_COMMITMENT_PDF
     ];
     let criticalMissing = false;
     expectedCols.forEach(colName => {
         let foundIndex = -1;
         const lowerCaseColName = colName.toLowerCase();
         for (let i = 0; i < headers.length; i++) { if (headers[i] && String(headers[i]).toLowerCase() === lowerCaseColName) { foundIndex = i + 1; break; } }
         if (foundIndex < 1) {
             Logger.log(`WARN: Column "${colName}" not found.`);
             // Check if missing column is critical
             if ([COL_PHONE_NUMBER, COL_LEADER_NAME, COL_EMAIL, COL_MEMBER_LIST].includes(colName)) {
                 criticalMissing = true;
             }
         }
         indices[colName] = foundIndex;
     });
     if (criticalMissing) { Logger.log("ERROR: Critical columns missing."); return null; }
     return indices;
 }

// --- createRowArray (Giữ nguyên) ---
function createRowArray(columnIndexMap, dataObject) {
     const maxColIndex = Math.max(...Object.values(columnIndexMap).filter(idx => idx > 0));
     if (maxColIndex <= 0) return [];
     const newRow = []; newRow.length = maxColIndex; newRow.fill('');
     for (const colName in dataObject) { if (dataObject.hasOwnProperty(colName) && columnIndexMap[colName] > 0) newRow[columnIndexMap[colName] - 1] = dataObject[colName]; }
     return newRow;
 }