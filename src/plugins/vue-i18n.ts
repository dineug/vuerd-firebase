import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const messages = {
  en: {
    Sidebar: {
      notebook: "notebook",
      myNotebook: "My Notebook",
      newNotebook: "New Notebook",
      setting: "Setting",
      signOut: "Sign out",
      signIn: "Sign in",
      signInGoogle: "Sign in With Google"
    },
    NewNotebook: {
      newNotebook: "New Notebook",
      title: "Title",
      published: "Published",
      tag: "Tag",
      create: "Create",
      cancel: "Cancel",
      creating: "Creating...",
      valid: {
        title: "Please enter a title"
      }
    },
    Setting: {
      picture: "Picture",
      name: "Name",
      nickname: "Nickname",
      email: "Email",
      language: "Language",
      invitation: "Invitation active",
      update: "Update",
      updating: "Updating...",
      valid: {
        name: "Please enter a name",
        nickname: "Please enter a nickname",
        imageType: "Picture must be JPG, PNG format",
        imageSize: "Picture size can not exceed 2MB"
      }
    }
  },
  ko: {
    Sidebar: {
      notebook: "노트북",
      myNotebook: "나의 노트북",
      newNotebook: "새 노트북",
      setting: "설정",
      signOut: "로그아웃",
      signIn: "로그인",
      signInGoogle: "Google 로그인"
    },
    NewNotebook: {
      newNotebook: "새 노트북",
      title: "제목",
      published: "공개여부",
      tag: "태그",
      create: "생성",
      cancel: "취소",
      creating: "생성중...",
      valid: {
        title: "제목을 입력해주세요"
      }
    },
    Setting: {
      picture: "사진",
      name: "이름",
      nickname: "닉네임",
      email: "이메일",
      language: "언어",
      invitation: "초대가능 여부",
      update: "수정",
      updating: "수정중...",
      valid: {
        name: "이름을 입력해주세요",
        nickname: "닉네임을 입력해주세요",
        imageType: "사진은 JPG, PNG 형식만 가능합니다",
        imageSize: "사진 크기는 2MB를 초과할 수 없습니다"
      }
    }
  }
};

export default new VueI18n({
  locale: "en",
  messages
});
