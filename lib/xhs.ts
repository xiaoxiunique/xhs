import type { SearchData } from "~/types/search";
import type { XHSResponse } from "~/types/search";
import { get_search_id } from "./sign";

type PostEntity = {
  id: string;
  xsec_token: string;
  cover: string;
  title: string;
  publish_time: string;
  user: {
    user_id: string;
    nickname: string;
    avatar: string;
    xsec_token: string;
  };
  interact_info: {
    liked_count: number;
    collected_count: number;
    comment_count: number;
  };
  imageList: string[];
  is_video: boolean;
};

export async function homeFeed(cursor: string): Promise<PostEntity[]> {
  const result = await $fetch<{
    data: {
      items: any[];
      has_more: boolean;
    };
  }>(`/api/edith/sns/web/v1/homefeed`, {
    method: "POST",
    body: {
      cursor_score: "1.7445192529610028E9",
      num: 27,
      refresh_type: 3,
      note_index: 39,
      unread_begin_note_id: "",
      unread_end_note_id: "",
      unread_note_count: 0,
      category: "homefeed_recommend",
      search_key: "",
      need_num: 12,
      image_formats: ["jpg", "webp", "avif"],
      need_filter_image: false,
    },
  });

  return result.data.items
    .filter((item) => item.model_type === "note")
    .map((item) => ({
      id: item.id,
      xsec_token: item.xsec_token,
      cover: item.note_card?.cover?.url_default,
      title: item.note_card?.display_title,
      publish_time: item.note_card?.corner_tag_info?.[0]?.text,
      user: {
        user_id: item.note_card?.user.user_id,
        nickname: item.note_card?.user.nickname,
        avatar: item.note_card?.user.avatar,
        xsec_token: item.note_card?.user.xsec_token,
      },
      interact_info: {
        liked_count: item.note_card?.interact_info?.liked_count || 0,
        collected_count: item.note_card?.interact_info?.collected_count || 0,
        comment_count: item.note_card?.interact_info?.comment_count || 0,
      },
      imageList:
        item.note_card?.image_list?.map((img: any) => img.info_list[0].url) ||
        [],
      is_video: item.note_card?.type === "video",
    }))
    .sort((a, b) => b.interact_info.liked_count - a.interact_info.liked_count);
}

export async function searchNotes(keyword: string) {
  const search_id = get_search_id();
  const result = await $fetch<XHSResponse<SearchData>>(
    "/api/edith/sns/web/v1/search/notes",
    {
      method: "POST",
      body: {
        keyword: keyword,
        page: 1,
        page_size: 20,
        search_id: search_id,
        sort: "general",
        note_type: 0,
        ext_flags: [],
        geo: "",
        image_formats: ["jpg", "webp", "avif"],
      },
    }
  );

  const notes = result.data.items
    .filter((item) => item.model_type === "note")
    .map((item) => ({
      id: item.id,
      xsec_token: item.xsec_token,
      cover: item.note_card?.cover?.url_default,
      title: item.note_card?.display_title,
      publish_time: item.note_card?.corner_tag_info?.[0]?.text,
      user: {
        user_id: item.note_card?.user.user_id,
        nickname: item.note_card?.user.nickname,
        avatar: item.note_card?.user.avatar,
        xsec_token: item.note_card?.user.xsec_token,
      },
      interact_info: {
        liked_count: item.note_card?.interact_info?.liked_count || 0,
        collected_count: item.note_card?.interact_info?.collected_count || 0,
        comment_count: item.note_card?.interact_info?.comment_count || 0,
      },
      imageList:
        item.note_card?.image_list?.map((img: any) => {
          // https://sns-webpic-qc.xhscdn.com/202507091728/5bc849e407569cf57466672c7574bf2e/1040g00831ihgqv2nge6g5n5aniqk6pjl0mvoeqg!nc_n_webp_mw_1
          // 1040g00831ihgqv2nge6g5n5aniqk6pjl0mvoeqg
          const fileId = img.info_list[0].url.split("/").pop()?.split(".")[0];
          return `https://ci.xiaohongshu.com/${fileId}?imageView2/2/w/1080/format/jpg`;
        }) ||
        [],
      is_video: item.note_card?.type === "video",
    }));

  return {
    items: notes,
    has_more: result.data.has_more,
  };
}
