import Script from "next/script";
import {InstagramPostProps} from "./types";

export function InstagramPost(props: InstagramPostProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] w=[500px]">
      <div className="h-full overflow-auto">
        <div dangerouslySetInnerHTML={{__html: props.html}} />
      </div>
      <Script async src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}
