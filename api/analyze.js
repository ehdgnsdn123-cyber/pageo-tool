export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: '이미지가 없어요!' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType || 'image/jpeg',
                  data: imageBase64,
                }
              },
              {
                type: 'text',
                text: `당신은 한국 이커머스 상세페이지 전문 디자이너이자 기획자입니다.
이 상세페이지 이미지를 아래 4가지 관점에서 깊이 있게 분석해주세요.

반드시 아래 JSON 형식으로만 답변하세요. 문자열 안에 큰따옴표 사용 금지:

{
  "industry": "업종",
  "product": "제품명 추정",

  "color_system": {
    "main_color": "메인 컬러와 헥스코드 추정",
    "sub_color": "서브 컬러",
    "accent_color": "강조 컬러",
    "color_emotion": "이 컬러 조합이 주는 감성과 브랜드 방향",
    "color_strategy": "컬러를 통한 구매 심리 전략"
  },

  "design_system": {
    "font_style": "폰트 스타일 분석 (굵기 위계, 크기 대비 등)",
    "layout_pattern": "레이아웃 패턴 (중앙정렬/좌우분할 등)",
    "spacing": "여백 활용 방식",
    "image_style": "이미지 사용 방식 (컷팅/배경/연출 등)",
    "visual_hierarchy": "시각적 위계 구조"
  },

  "planning_analysis": {
    "target_customer": "타겟 고객 추정",
    "core_message": "핵심 메시지",
    "customer_flow": "고객 심리 흐름 (왜 이 순서로 구성했는가)",
    "conversion_strategy": "구매 전환 전략",
    "differentiation": "경쟁 제품과의 차별화 포인트"
  },

  "sections_found": ["발견된 섹션"],
  "main_section": "주요 섹션",
  "section_details": [
    {
      "name": "섹션 이름",
      "found": true,
      "content": "어떤 내용과 메시지를 담았는지",
      "planning_intent": "이 섹션의 기획 의도",
      "design_technique": "사용된 디자인 기법"
    }
  ],

  "good_points": ["잘된 점1", "잘된 점2", "잘된 점3"],
  "reference_points": ["참고할 점1", "참고할 점2"]
}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'API 오류' });
    }

    const text = data.content[0].text;

    let result;
    try {
      const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = codeBlock ? codeBlock[1].trim() : text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) return res.status(500).json({ error: '응답 파싱 오류' });
      result = JSON.parse(jsonStr);
    } catch {
      return res.status(500).json({ error: '다시 시도해주세요.' });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
