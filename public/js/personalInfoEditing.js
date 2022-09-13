// 本code能夠保證：
// 幹部帳號可以：「無限次」「閱覽、編輯」「所有」帳號的身分資料
// 社員帳號可以：「無限次」「閱覽」「自己」的身分資料、「只有最初一次」「編輯」「自己」的身分資料
// 社員帳號無法：「任何一次」「閱覽」「他人」的身分資料





var canEdit = false;

var curUser;

var boolEdited = false;
var goalUID = "";
var isGanBu = false;
function init() {
    var btnBackToHomePage = document.getElementById('backToHomePage');
    btnBackToHomePage.addEventListener('click', () => {
        if (boolEdited) {
            location.replace("./index.html");
        }
        else {
            boolEdited = true;
            alert("您沒有修改任何內容！若您執意要回首頁，則再點按一次這個按鍵即可");
            return;
        }
    });


    var info = window.location.search.replace("?", "").split("&");
    console.log(info);
    goalUID = info[0].replace("UID=", "");

    firebase.auth().onAuthStateChanged(user => {
        curUser = user;

        if (curUser) {
            var haveDoneWritingPersonalInfo;
            firebase.database().ref('users/' + goalUID + '/haveDoneWritingPersonalInfo').once("value").then(snapShot => {
                if (snapShot.val() == "Y") haveDoneWritingPersonalInfo = true;
                else haveDoneWritingPersonalInfo = false;
            }).then(() => {
                firebase.database().ref('users/' + curUser.uid + '/admin').once("value").then(snapShot => {
                    if (snapShot.val() != 'Y') isGanBu = false;
                    else isGanBu = true;
                }).then(() => {
                    if (!isGanBu && goalUID != curUser.uid) {
                        //不是幹部，也不是真正的那個使用者
                        //那就是想要竊取資訊的人
                        //那就什麼都不能拿
                        return;
                    }



                    canEdit = ((!haveDoneWritingPersonalInfo) || isGanBu);

                    //先從server獲取現在的資料，並且填到相對應的格子
                    //如果有編輯權限的話，再把readonly解掉
                    var infoRef = firebase.database().ref('users/' + goalUID);
                    var studentID;
                    var xiJi;
                    var realName;

                    var PhoneNum;

                    infoRef.once("value").then(snapShot => {
                        studentID = snapShot.val().Name.split(" ")[0];
                        xiJi = snapShot.val().Name.split(" ")[1];
                        realName = snapShot.val().Name.split(" ")[2];

                        PhoneNum = (snapShot.val().Phone == undefined ? "" : snapShot.val().Phone);

                        document.getElementById("studentID").value = studentID;
                        document.getElementById("xiJi").value = (xiJi == undefined ? "" : xiJi);
                        document.getElementById("realName").value = (realName == undefined ? "" : realName);

                        document.getElementById("phoneNumber").value = (PhoneNum == undefined ? "" : PhoneNum);

                        document.getElementById("studentID_and_xiJi_and_realname").value = studentID + " " + (xiJi == undefined ? "" : xiJi) + " " + (realName == undefined ? "" : realName);
                        document.getElementById("studentID_and_xiJi_and_realname").value = (document.getElementById("studentID_and_xiJi_and_realname").value == "  " ? "" : document.getElementById("studentID_and_xiJi_and_realname").value);
                        document.getElementById("phoneNumber_check").value = PhoneNum;

                        if (!canEdit) {
                            document.getElementById('studentID').readOnly = true;
                            document.getElementById('xiJi').readOnly = true;
                            document.getElementById('realName').readOnly = true;

                            document.getElementById('phoneNumber').readOnly = true;
                        }
                    }).then(() => {
                        document.getElementById("studentID").addEventListener('change', () => {
                            reGenerate_upperBox_string();
                        });
                        document.getElementById("xiJi").addEventListener('change', () => {
                            reGenerate_upperBox_string();
                        });
                        document.getElementById("realName").addEventListener('change', () => {
                            reGenerate_upperBox_string();
                        });

                        document.getElementById("phoneNumber").addEventListener('change', () => {
                            reGenerate_lowerBox_string();
                        });

                        document.getElementById("submitBut").addEventListener('click', () => {
                            tryToChangePersonalInfo();
                        });
                    });
                });
            });
        }
    });
}

window.onload = function () {
    init();
};


function reGenerate_upperBox_string() {
    var studentID = document.getElementById("studentID").value
    var xiJi = (document.getElementById("xiJi").value) == undefined ? "" : document.getElementById("xiJi").value;
    var realName = (document.getElementById("realName").value == undefined) ? "" : document.getElementById("realName").value;

    document.getElementById("studentID_and_xiJi_and_realname").value = studentID + " " + xiJi + " " + realName;
    return;
}


function reGenerate_lowerBox_string() {
    document.getElementById("phoneNumber_check").value = document.getElementById("phoneNumber").value;
    return;
}

function tryToChangePersonalInfo() {
    if (!canEdit) {
        alert("本表格僅供填寫一次，若有填寫錯誤或任何需要更改的內容，請洽詢幹部處理！");
    }
    else {
        var studentID;
        var xiJi;
        var realName;
        var PhoneNum;

        studentID = document.getElementById("studentID").value;
        xiJi = document.getElementById("xiJi").value;
        realName = document.getElementById("realName").value;

        PhoneNum = document.getElementById("phoneNumber").value;

        var studentID_checkNoSpace = studentID.search(" "); //如果沒有找到相應的東西，應該會return -1。
        var xiJi_checkNoSpace = xiJi.search(" "); //如果沒有找到相應的東西，應該會return -1。
        var realName_checkNoSpace = realName.search(" "); //如果沒有找到相應的東西，應該會return -1。
        var PhoneNum_checkNoSpace = PhoneNum.search(" "); //如果沒有找到相應的東西，應該會return -1。
        // console.log(studentID_checkNoSpace, xiJi_checkNoSpace, realName_checkNoSpace, PhoneNum_checkNoSpace);
        // console.log(studentID.match(/^(1)([0-9]{8})$/));
        // console.log(studentID.match(/^(987654321)$/));
        // console.log(studentID.match(/^(123456789)$/));
        // console.log(PhoneNum.match(/^(09)([0-9]{8})$/));

        if (studentID_checkNoSpace != -1 || xiJi_checkNoSpace != -1 || realName_checkNoSpace != -1 || PhoneNum_checkNoSpace != -1) {
            alert("您的填答內容存在空格，請消滅空格後重試。如仍出現錯誤，請直接聯繫幹部！");
            return;
        }
        else if (studentID == "" || xiJi == "" || realName == "" || PhoneNum == "") {
            alert("四個格子都是必填！");
            return;
        }
        else if (studentID.match(/^(1)([0-9]{8})$/) == null && studentID.match(/^(987654321)$/) == null && studentID.match(/^(123456789)$/) == null) {
            alert("學號格式不正確！\n請確保您的學號是1開頭，後面再串有8個阿拉伯數字！\n校外人士請確認輸入的確實是「987654321」！\n若您填寫的是員編，很抱歉因為我們不知道員編的正確格式，因此請您填寫「123456789」之後再聯繫幹部，來做修正！")
            return;
        }
        else if (PhoneNum.match(/^(09)([0-9]{8})$/)/*會回傳一個array來儲存相關資料（長度！=1）。但如果找不到，會return的是null*/ == null) {
            alert("手機號碼格式錯誤，請填寫正確的不含任何格線的格式！\n例如：\n09xyabcpqr -> 正確\n09xy-abc-pqr -> 錯誤")
            return;
        }
        else {
            var newName = studentID + " " + xiJi + " " + realName;
            var newPhoneNum = PhoneNum;

            firebase.database().ref('users/' + goalUID).update({
                haveDoneWritingPersonalInfo: "Y",
                Name: newName,
                Phone: newPhoneNum
            }).then(() => {
                boolEdited = true;
                alert("資料填寫成功！");
            });

        }
    }




}

