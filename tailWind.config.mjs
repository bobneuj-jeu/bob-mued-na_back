export default {
    // content: TailwindCSS가 적용될 파일들을 지정해요. 예를 들어, .html, .js 등 파일에서 TailwindCSS가 적용될 거예요.
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  
    theme: { // theme: 사용할 색깔이나 스타일 추가 및 변경
      extend: { // extend: 기본 테마에 새로운 색깔을 추가
        colors: { // colors: 추가할 색깔들을 정의
          primaryBg: "#444444", // 배경
          primary: "#DE5D00", // 주 색깔
        },
      },
    },
    plugins: [],
  };
  

