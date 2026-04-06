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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: [
              ...imageBlocks,
              {
                type: 'text',
                text: `당신은 한국 이커머스 상세페이지 전문 디자이너이자 카피라이터이자 마케터입니다.
이 상세페이지 이미지를 아래 7가지 관점에서 전문가 수준으로 깊이 분석해주세요.
각 항목은 단순 설명이 아니라 왜 그렇게 했는지 의도와 효과까지 분석해야 합니다.

반드시 아래 JSON 형식으로만 답변하세요. 문자열 안에 큰따옴표 사용 금지:

{
  "industry": "업종",
  "product": "제품명 추정",

  "color_system": {
    "main_color": "메인 컬러 이름과 헥스코드 추정 (예: 딥 네이비 #1A2B4C)",
    "sub_color": "서브 컬러 이름과 헥스코드 추정",
    "accent_color": "강조 컬러 이름과 헥스코드 추정 (CTA 버튼 등)",
    "background_color": "배경 컬러",
    "text_color": "본문 텍스트 컬러",
    "color_ratio": "메인:서브:강조 비율 추정 (예: 60:30:10)",
    "color_harmony": "컬러 하모니 타입 (보색/유사색/트라이어드 등)",
    "color_psychology": "각 컬러가 주는 심리적 효과와 구매 감정에 미치는 영향",
    "color_emotion": "전체 컬러 조합이 주는 브랜드 감성",
    "color_strategy": "컬러를 통한 구매 심리 유도 전략"
  },

  "design_system": {
    "font_hierarchy": "H1-H2-본문 폰트 위계 구조 (크기 대비, 굵기 차이)",
    "font_style": "폰트 스타일 분석 (세리프/산세리프, 분위기)",
    "font_emphasis": "강조 기법 (볼드/컬러/크기/밑줄 중 무엇을 어떻게 사용)",
    "layout_pattern": "레이아웃 패턴 (중앙정렬/좌우분할/비대칭 등)",
    "eye_flow": "시선 흐름 패턴 (Z패턴/F패턴/중앙집중 등) - 왜 이 패턴인지 의도 포함",
    "grid_structure": "그리드 구조 (1단/2단/3단, 카드형/풀블리드 등)",
    "spacing_strategy": "여백 전략 (여백을 어떻게 활용해 시선과 집중을 유도하는지)",
    "image_style": "이미지 사용 방식 (컷팅/배경/연출/라이프스타일 등)",
    "visual_hierarchy": "시각적 위계 구조 - 무엇을 먼저 보게 만드는가",
    "design_mood": "전체 디자인 무드 (럭셔리/미니멀/활기/신뢰감 등)"
  },

  "copywriting_analysis": {
    "headline_formula": "헤드라인 공식 분석 (PAS/AIDA/숫자 활용/의문형/공감형 등)",
    "emotional_triggers": ["감정 트리거 키워드 1", "감정 트리거 키워드 2", "감정 트리거 키워드 3"],
    "pain_point_expression": "고객 고통 포인트를 어떻게 표현했는가",
    "benefit_expression": "혜택과 결과를 어떻게 표현했는가",
    "cta_strategy": "CTA 문구 전략 (행동 유발 방식, 긴박감 조성 여부)",
    "tone_of_voice": "전체 톤앤매너 (친근/전문/감성/권위 등)"
  },

  "persuasion_techniques": {
    "social_proof": "사회적 증거 활용 여부와 방식 (리뷰수/구매수/인증 등)",
    "authority": "권위 및 전문성 표현 방식 (수상/인증/언론/전문가 등)",
    "scarcity": "희소성/긴박감 조성 여부와 방식 (한정/마감/선착순 등)",
    "reciprocity": "상호성 활용 여부 (무료 제공/보너스/혜택 등)",
    "trust_elements": "신뢰 구축 요소 (보증/환불/배송 등)",
    "used_techniques": ["사용된 설득 기법 1", "사용된 설득 기법 2", "사용된 설득 기법 3"]
  },

  "planning_analysis": {
    "target_customer": "타겟 고객 상세 추정 (연령/성별/상황/니즈)",
    "core_message": "이 상세페이지의 핵심 메시지 한 줄 요약",
    "aida_analysis": "AIDA 프레임워크로 분석 (Attention-Interest-Desire-Action 각각 어떻게 구현했나)",
    "customer_flow": "고객 심리 흐름 단계별 분석 (왜 이 순서로 구성했는가)",
    "conversion_strategy": "구매 전환 전략 (무엇이 최종 구매 결정을 유도하는가)",
    "differentiation": "경쟁 제품과의 차별화 포인트",
    "weakness": "기획적으로 아쉬운 점 또는 보완하면 좋을 부분"
  },

  "sections_found": ["발견된 섹션"],
  "main_section": "가장 강조된 주요 섹션",
  "section_details": [
    {
      "name": "섹션 이름",
      "found": true,
      "content": "어떤 내용과 메시지를 담았는지",
      "planning_intent": "이 섹션의 기획 의도 - 왜 여기에 배치했는가",
      "design_technique": "사용된 디자인 기법과 시각적 처리 방식",
      "copy_technique": "카피 기법 (어떤 감정/논리로 설득하는가)",
      "improvement": "이 섹션에서 개선하면 효과적인 제안"
    }
  ],

  "good_points": ["잘된 점1 (구체적 이유 포함)", "잘된 점2", "잘된 점3"],
  "reference_points": ["참고할 점1 (개선 방향 포함)", "참고할 점2"],
  "key_learnings": ["이 상세페이지에서 배울 핵심 인사이트 1", "핵심 인사이트 2", "핵심 인사이트 3"],

  "planning_brief": {
    "target_definition": "이 레퍼런스를 참고해 내가 만들 상세페이지의 타겟 고객을 어떻게 정의하면 좋은지 구체적으로",
    "message_direction": "핵심 메시지를 어떤 방향으로 잡아야 하는지 - 이 레퍼런스에서 배운 점 적용",
    "intro_suggestion": "인트로/헤드라인을 어떻게 시작하면 효과적인지 공식과 방향 제시",
    "features_direction": "특장점 섹션을 어떻게 구성하면 설득력 있는지",
    "trust_strategy": "신뢰를 쌓기 위해 어떤 요소를 넣어야 하는지",
    "conversion_tactics": "구매 결정을 유도하기 위해 어떤 장치를 사용해야 하는지",
    "recommended_flow": "이 레퍼런스를 참고해 추천하는 섹션 구성 순서와 이유",
    "copy_tone": "어떤 톤앤매너로 카피를 써야 이 타겟에게 효과적인지"
  }
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
