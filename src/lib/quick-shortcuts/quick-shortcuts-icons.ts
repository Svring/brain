export const QUICK_SHORTCUT_DEFAULT_ICON = "https://sealos.run/logo.svg";

export const QUICK_SHORTCUT_ICONS: Record<string, string> = {
	// Database icons (db-appicons)
	PostgreSQL: "/icons/db-appicons/pgicon.svg",
	MongoDB: "/icons/db-appicons/mongoicon.svg",
	MySQL: "/icons/db-appicons/mysqlicon.svg",
	Redis: "/icons/db-appicons/redisicon.svg",
	Kafka: "/icons/db-appicons/kafkaicon.svg",
	Milvus: "/icons/db-appicons/milvus.svg",

	// Dev Runtime icons (stacks-appicons)
	memU: "/icons/stacks-appicons/memu.png",
	"Next.js": "/icons/stacks-appicons/nextjs.svg",
	React: "/icons/stacks-appicons/react.svg",
	Astro: "/icons/stacks-appicons/astro.svg",
	Django: "/icons/stacks-appicons/django.svg",
	Flask: "/icons/stacks-appicons/flask.svg",
	"Spring Boot": "/icons/stacks-appicons/springboot.svg",
	Python: "/icons/stacks-appicons/python.svg",
	Go: "/icons/stacks-appicons/golang.svg",
	PHP: "/icons/stacks-appicons/php.svg",
	Java: "/icons/stacks-appicons/java.svg",
	Rust: "/icons/stacks-appicons/rust.svg",

	// AI Agent icons (aiagent-appicons)
	N8N: "/icons/aiagent-appicons/n8n.svg",
	Dify: "/icons/aiagent-appicons/dify.svg",
	FastGPT: "/icons/aiagent-appicons/fastgpt.svg",
	"Lobe Chat": "/icons/aiagent-appicons/lobechat.svg",
};

/**
 * Get icon URL for a given option value
 * @param value - The option value
 * @returns Icon URL or default icon if not found
 */
export function getQuickShortcutIcon(value: string): string {
	return QUICK_SHORTCUT_ICONS[value] || QUICK_SHORTCUT_DEFAULT_ICON;
}
