import { App, inject } from "vue";

import {
	createClient,
	getEndpoint,
	predicate,
	cookie,
} from "@prismicio/client";
import {
	asDate,
	asHTML,
	asLink,
	asText,
	documentToLinkField,
	documentAsLink,
} from "@prismicio/helpers";

import { isExternal } from "./lib/isExternal";
import { prismicKey } from "./injectionSymbols";
import type {
	PrismicPlugin,
	PrismicPluginClient,
	PrismicPluginHelpers,
	PrismicPluginOptions,
} from "./types";

export const createPrismic = (options: PrismicPluginOptions): PrismicPlugin => {
	// Creating plugin client
	const prismicClient: PrismicPluginClient = {
		client:
			"client" in options
				? options.client
				: createClient(
						isExternal(options.endpoint)
							? options.endpoint
							: getEndpoint(options.endpoint),
						options.clientConfig,
				  ),
		predicate,
		cookie,
	};

	// Creating plugin helpers
	const prismicHelpers: PrismicPluginHelpers = {
		asText,
		asHTML: (richTextField, linkResolver, htmlSerializer) => {
			return asHTML(
				richTextField,
				linkResolver || options.linkResolver,
				htmlSerializer || options.htmlSerializer,
			);
		},
		asLink: (linkField, linkResolver) => {
			return asLink(linkField, linkResolver || options.linkResolver);
		},
		asDate,

		documentToLinkField,
		documentAsLink: (prismicDocument, linkResolver) => {
			return documentAsLink(
				prismicDocument,
				linkResolver || options.linkResolver,
			);
		},
	};

	// Creating plugin instance
	const prismic: PrismicPlugin = {
		options,

		...prismicClient,
		...prismicHelpers,

		install(app: App): void {
			app.provide(prismicKey, this);
			app.config.globalProperties.$prismic = this;
		},
	};

	return prismic;
};

export function usePrismic(): PrismicPlugin {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return inject(prismicKey)!;
}
