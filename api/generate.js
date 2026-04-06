export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { product, industry, target, features, price } = req.body;

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
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: `당신은 한국 이커머스 상세페이지 전문 디자이너입니다.
아래 제품 정보를 바탕으로 상세페이지 9개 구성요소에 맞게 레이아웃 구성안을 만들어주세요.

제품명: ${product}
업종: ${industry}
타겟: ${target || '미입력'}
가격: ${price || '미입력'}
제품 특징: ${features || '미입력'}

상세페이지 9개 구성요소:
1. 인트로 - 첫 눈에 시선을 잡는 섹션
2. 메인페이지 - 제품의 핵심 가치 전달
3. 특장점 - 제품의 차별화된 특징
4. 인증/권위입증 - 신뢰를 높이는 인증, 수상, 전문가 추천
5. 비교 - 경쟁 제품 또는 사용 전후 비교
6. 리뷰 - 실제 고객 후기 강조
7. 브랜드 소개/스토리 - 브랜드 신뢰도 구축
8. 이벤트/배너 - 구매 유도, 할인, 혜택 강조
9. 자주묻는 질문 - 구매 망설임 해소

반드시 아래 JSON 형식으로만 답변하세요. 문자열 안에 큰따옴표를 절대 사용하지 마세요:
{
  "headline": "메인 헤드라인",
  "subheadline": "서브 헤드라인",
  "color_direction": "추천 컬러 방향",
  "sections": [
    {
      "order": 1,
      "name": "인트로",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 2,
      "name": "메인페이지",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 3,
      "name": "특장점",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 4,
      "name": "인증/권위입증",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 5,
      "name": "비교",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 6,
      "name": "리뷰",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 7,
      "name": "브랜드 소개/스토리",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 8,
      "name": "이벤트/배너",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    },
    {
      "order": 9,
      "name": "자주묻는 질문",
      "copy": "카피 문구",
      "layout_tip": "레이아웃 팁",
      "key_visual": "핵심 비주얼 요소"
    }
  ]
}`
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
