export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, images, mimeType } = req.body;

  if (!imageBase64 && (!images || images.length === 0)) {
    return res.status(400).json({ error: '이미지가 없어요!' });
  }

  // 단일 이미지 또는 PDF 전체 페이지 배열 처리
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
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: [
              ...imageBlocks,
              {
                type: 'text',
                text: `당신은 한국 이커머스 상세페이지 기획 전문가입니다.
이 상세페이지 이미지${imageBlocks.length > 1 ? ` (총 ${imageBlocks.length}장, 순서대로 이어지는 페이지)` : ''}를 분석해서, 비슷한 제품의 상세페이지를 기획하려는 디자이너가 바로 참고할 수 있는 기획서를 만들어주세요.

이미지에 있는 실제 텍스트, 내용, 구성을 정확히 읽고 분석하세요. 추측하거나 지어내지 마세요.

반드시 아래 JSON 형식으로만 답변하세요. 문자열 안에 큰따옴표 사용 금지:

{
  "industry": "업종 (이미지에서 읽은 실제 내용 기반)",
  "product": "제품명 (이미지에서 읽은 실제 내용 기반)",
  "target_customer": "타겟 고객 - 누구를 위한 제품인지 (연령/성별/상황/고민)",
  "core_message": "이 상세페이지가 전달하는 핵심 메시지 한 줄",

  "section_flow": [
    {
      "order": 1,
      "name": "섹션명",
      "actual_content": "이 섹션에서 실제로 무슨 내용을 담고 있는지 (이미지에서 읽은 내용)",
      "planning_reason": "왜 이 섹션을 이 순서에 배치했는가 - 고객 심리 관점에서",
      "copy_approach": "어떤 방식으로 고객을 설득하는가 (감정/논리/증거 중 무엇을 활용)",
      "my_application": "내가 비슷한 제품 기획할 때 이 섹션에서 참고할 점"
    }
  ],

  "persuasion_flow": "처음부터 끝까지 고객 심리를 어떻게 이끌어가는지 흐름 설명",
  "key_copy_techniques": ["실제로 사용된 카피 기법 1", "카피 기법 2", "카피 기법 3"],
  "trust_building": "신뢰를 어떻게 쌓았는지 (인증/리뷰/수치/보증 등 실제 사용된 것)",
  "purchase_trigger": "최종 구매 결정을 유도하는 핵심 장치",

  "my_planning_guide": {
    "recommended_sections": "이 레퍼런스 기반으로 추천하는 섹션 구성 순서와 각 섹션에 넣을 내용",
    "headline_direction": "인트로 헤드라인을 어떻게 시작하면 좋은지",
    "copy_tone": "어떤 말투와 감성으로 써야 하는지",
    "must_include": ["반드시 포함해야 할 요소 1", "요소 2", "요소 3"],
    "differentiation_tip": "경쟁 상세페이지와 차별화할 수 있는 포인트"
  },

  "key_learnings": ["이 레퍼런스에서 배울 핵심 인사이트 1", "인사이트 2", "인사이트 3"]
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

      // JSON이 잘렸을 경우 마지막 완전한 필드까지만 복구
      try {
        result = JSON.parse(jsonStr);
      } catch {
        // 잘린 JSON 복구 시도: 마지막 완전한 키-값 이후를 닫아줌
        const truncated = jsonStr.replace(/,?\s*"[^"]*"\s*:\s*[^,}\]]*$/, '')
                                  .replace(/,\s*$/, '');
        const fixed = truncated + (truncated.includes('{') ? '}' : '');
        result = JSON.parse(fixed);
      }
    } catch {
      return res.status(500).json({ error: '응답이 너무 깁니다. 페이지 수를 줄이거나 다시 시도해주세요.' });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
