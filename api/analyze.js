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
        max_tokens: 1500,
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
                text: `이 이미지는 한국 이커머스 상세페이지입니다.
아래 9개 구성요소 기준으로 각 섹션이 어떤 내용으로 구성되어 있는지 자세하게 분석해주세요:
1.인트로 2.메인페이지 3.특장점 4.인증/권위입증 5.비교 6.리뷰 7.브랜드소개/스토리 8.이벤트/배너 9.자주묻는질문

반드시 아래 JSON 형식으로만 답변하세요. 문자열 안에 큰따옴표 사용 금지:
{
  "industry": "업종 추정",
  "product": "제품 추정",
  "layout_style": "레이아웃 스타일",
  "color_tone": "컬러 톤 분석",
  "sections_found": ["발견된 섹션1", "발견된 섹션2"],
  "main_section": "이 이미지의 주요 섹션",
  "section_details": [
    {
      "name": "섹션 이름",
      "found": true,
      "content": "이 섹션에서 어떤 내용을 어떻게 표현했는지 자세한 설명",
      "technique": "사용된 디자인 기법이나 카피 전략"
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
