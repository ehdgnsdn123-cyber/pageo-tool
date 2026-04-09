export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, images, mimeType, pdfText } = req.body;

  if (!imageBase64 && (!images || images.length === 0)) {
    return res.status(400).json({ error: '이미지가 없어요!' });
  }

  const imageBlocks = images
    ? images.map(data => ({
        type: 'image',
        source: { type: 'base64', media_type: mimeType || 'image/jpeg', data }
      }))
    : [{
        type: 'image',
        source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 }
      }];

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
              ...imageBlocks,
              ...(pdfText ? [{
                type: 'text',
                text: `PDF 전체 텍스트:\n\n${pdfText.slice(0, 10000)}`
              }] : []),
              {
                type: 'text',
                text: `당신은 한국 이커머스 상세페이지 기획 전문가입니다.
이 상세페이지를 아래 9가지 구성요소 기준으로 세밀하게 분석하세요.
실제 텍스트와 내용을 직접 인용해서 구체적으로 작성하세요. 추상적인 말 금지.
디자인/색상 분석 금지. 오직 기획 구조와 카피에만 집중.

반드시 아래 JSON 형식으로만 답변하세요. 문자열 안에 큰따옴표 사용 금지:

{
  "product": "제품명",
  "industry": "업종",
  "target": "타겟 고객 (연령/성별/상황/고민 구체적으로)",
  "overall_strategy": "이 상세페이지 전체 기획 전략 한 줄 요약",

  "components": {
    "intro": {
      "exists": true,
      "headline": "실제 헤드라인 카피 직접 인용",
      "sub_copy": "서브 카피 직접 인용",
      "hook_method": "어떤 방식으로 첫 후킹을 하는가 (공포/욕망/공감/호기심 중)",
      "target_pain": "첫 화면에서 건드리는 고객의 어떤 감정/고통인가",
      "planning_tip": "인트로 기획 시 이 레퍼런스에서 배울 점"
    },
    "main_page": {
      "exists": true,
      "key_message": "메인 제품 소개에서 전달하는 핵심 가치",
      "copy_example": "대표 카피 직접 인용",
      "structure": "어떤 순서로 제품을 소개하는가 (문제→해결/기능→효과/스펙→감성 등)",
      "planning_tip": "메인 페이지 기획 시 배울 점"
    },
    "features": {
      "exists": true,
      "feature_list": ["특장점 1 (실제 내용)", "특장점 2", "특장점 3"],
      "presentation_style": "특장점을 어떻게 표현했는가 (숫자/비교/스토리/이미지 등)",
      "copy_example": "특장점 카피 직접 인용",
      "planning_tip": "특장점 섹션 기획 시 배울 점"
    },
    "authority": {
      "exists": true,
      "proof_types": ["사용된 인증/권위 요소 1", "요소 2"],
      "copy_example": "인증/권위 관련 카피 직접 인용",
      "credibility_method": "어떤 방식으로 신뢰를 쌓는가",
      "planning_tip": "인증/권위 섹션 기획 시 배울 점"
    },
    "comparison": {
      "exists": true,
      "comparison_type": "무엇과 비교하는가 (경쟁사/이전 제품/before-after 등)",
      "winning_points": ["비교에서 우위를 점하는 포인트 1", "포인트 2"],
      "copy_example": "비교 관련 카피 직접 인용",
      "planning_tip": "비교 섹션 기획 시 배울 점"
    },
    "review": {
      "exists": true,
      "review_style": "리뷰를 어떻게 보여주는가 (별점/텍스트/사진/동영상 등)",
      "selected_reviews": "어떤 종류의 리뷰를 선별해서 보여주는가",
      "copy_example": "대표 리뷰 문구 직접 인용",
      "planning_tip": "리뷰 섹션 기획 시 배울 점"
    },
    "brand_story": {
      "exists": true,
      "story_angle": "브랜드/제품 스토리를 어떤 각도로 풀어가는가",
      "copy_example": "브랜드 스토리 핵심 카피 직접 인용",
      "emotional_hook": "스토리에서 감정적으로 건드리는 포인트",
      "planning_tip": "브랜드 스토리 기획 시 배울 점"
    },
    "event_banner": {
      "exists": true,
      "offer_type": "어떤 혜택/이벤트를 제시하는가",
      "urgency_method": "희소성/긴박감을 만드는 방식",
      "cta_copy": "CTA 버튼 문구 직접 인용",
      "planning_tip": "이벤트/배너 기획 시 배울 점"
    },
    "faq": {
      "exists": true,
      "question_types": ["어떤 유형의 질문을 다루는가 1", "유형 2", "유형 3"],
      "concern_addressed": "FAQ로 해소하는 고객의 핵심 불안은 무엇인가",
      "planning_tip": "FAQ 기획 시 배울 점"
    }
  },

  "flow_analysis": "9개 구성요소가 어떤 순서로 배치되었고 왜 그 순서인가 (고객 심리 흐름 기준)",
  "missing_components": ["이 상세페이지에서 없거나 약한 구성요소"],
  "strongest_section": "가장 잘 만들어진 섹션과 이유",
  "key_copy_techniques": [
    {
      "name": "카피 기법 이름",
      "example": "실제 사용 예시 직접 인용",
      "effect": "이 기법의 심리적 효과"
    }
  ]
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
      let jsonStr = codeBlock ? codeBlock[1].trim() : text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) return res.status(500).json({ error: '응답 파싱 오류' });

      try {
        result = JSON.parse(jsonStr);
      } catch {
        const truncated = jsonStr.replace(/,?\s*"[^"]*"\s*:\s*[^,}\]]*$/, '').replace(/,\s*$/, '');
        const fixed = truncated + (truncated.includes('{') ? '}' : '');
        result = JSON.parse(fixed);
      }
    } catch {
      return res.status(500).json({ error: '응답 파싱 오류. 다시 시도해주세요.' });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
