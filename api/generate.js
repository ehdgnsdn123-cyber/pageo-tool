export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { product, industry, target, features } = req.body;

  if (!product || !industry) {
    return res.status(400).json({ error: '제품명과 업종은 필수예요!' });
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
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `당신은 한국 이커머스 상세페이지 전문 디자이너입니다.
아래 제품 정보를 바탕으로 상세페이지 레이아웃 구성안을 만들어주세요.

제품명: ${product}
업종: ${industry}
타겟: ${target || '미입력'}
제품 특징: ${features || '미입력'}

아래 JSON 형식으로만 답변해주세요:
{
  "headline": "메인 헤드라인 (20자 이내)",
  "subheadline": "서브 헤드라인 (30자 이내)",
  "sections": [
    {
      "order": 1,
      "name": "섹션 이름",
      "purpose": "이 섹션의 목적",
      "copy": "실제 카피 문구",
      "layout_tip": "디자인/레이아웃 팁"
    }
  ],
  "color_direction": "추천 컬러 방향",
  "design_tip": "전체 디자인 방향 팁"
}

섹션은 6~8개로 구성하고, 실제로 바로 쓸 수 있는 카피를 작성해주세요.`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'API 오류' });
    }

    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: '응답 파싱 오류' });
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
