/**
 * Handlebars helper to process custom syntax in markdown content.
 *
 * 1. Syntax for admonitions:
 * $$TYPE
 * title: Admonition Title
 * Content goes here...
 * $$
 *
 * Supported admonition types: WARNING, INFO, DANGER
 *
 * 2. Syntax for tabbed content:
 * $$generic
 * === "Tab 1 Title"
 * Tab 1 content...
 *
 * === "Tab 2 Title"
 * Tab 2 content...
 * $$
 *
 * 3. Syntax for text highlighting:
 * ==highlighted text==
 *
 * 4. Syntax for Mermaid diagrams:
 * ```mermaid
 * flowchart TD
 *     A[Start] --> B[End]
 * ```
 */

let tabSetCounter = 0

function processMermaidBlocks(content) {
    const mermaidPattern = /```mermaid\s*\n([\s\S]*?)```/gi

    return content.replace(mermaidPattern, (match, diagramContent) => {
        return `<div class="mermaid-container">
<pre class="mermaid">
${diagramContent.trim()}
</pre>
</div>`
    })
}

function processTabbedContent(content) {
    const tabbedPattern = /\$\$generic\s*\n([\s\S]*?)\s*\$\$/gi

    return content.replace(tabbedPattern, (match, innerContent) => {
        tabSetCounter++
        const tabSetId = tabSetCounter

        const tabPattern = /===\s*"([^"]+)"\s*\n/g
        const tabs = []
        let tabMatch

        const tabMarkers = []
        while ((tabMatch = tabPattern.exec(innerContent)) !== null) {
            tabMarkers.push({
                title: tabMatch[1],
                startIndex: tabMatch.index,
                contentStartIndex: tabMatch.index + tabMatch[0].length
            })
        }

        const leadingIndentationPattern = /^ {4}/gm

        for (let i = 0; i < tabMarkers.length; i++) {
            const currentMarker = tabMarkers[i]
            const nextMarker = tabMarkers[i + 1]
            const contentEndIndex = nextMarker ? nextMarker.startIndex : innerContent.length

            const tabContent = innerContent
                .substring(currentMarker.contentStartIndex, contentEndIndex)
                .trim()
                // Normalize indentation - remove leading 4 spaces from each line
                .replace(leadingIndentationPattern, '')

            tabs.push({
                title: currentMarker.title,
                content: tabContent
            })
        }

        if (tabs.length === 0) {
            // No tabs found, return content as-is within a simple p wrapper
            return `<p>\n\n${innerContent.trim()}\n\n</p>`
        }

        const tabCount = tabs.length
        let html = `<div class="tabbed-set" data-tabs="${tabSetId}:${tabCount}">`

        tabs.forEach((tab, index) => {
            const tabId = `__tabbed_${tabSetId}_${index + 1}`
            const isChecked = index === 0 ? ' checked="checked"' : ''

            html += `<input${isChecked} id="${tabId}" name="__tabbed_${tabSetId}" type="radio">`
            html += `<label for="${tabId}">${tab.title}</label>`
            html += `<div class="tabbed-content">\n\n${tab.content}\n\n</div>`
        })

        html += '</div>'

        return html
    })
}

function processAdmonitionBlocks(content) {
    const admonitionPattern = /\$\$(WARNING|INFO|DANGER)\s*\n([\s\S]*?)\s*\$\$/gi

    return content.replace(admonitionPattern, (match, type, innerContent) => {
        const normalizedType = type.toUpperCase()
        const cssClass = `admonition admonition-${normalizedType.toLowerCase()}`

        // Extract title if present (format: "title: Some Title")
        const titleMatch = innerContent.match(/^title:\s*(.+?)(?:\r?\n|$)/i)
        let title = normalizedType
        let bodyContent = innerContent

        if (titleMatch) {
            title = titleMatch[1].trim()
            bodyContent = innerContent.replace(titleMatch[0], '')
        }

        bodyContent = bodyContent.trim()

        return `<div class="${cssClass}">
<div class="admonition-title">${title}</div>
<div class="admonition-content">

${bodyContent}

</div>
</div>`
    })
}

function processTextHighlighting(content) {
    const highlightPattern = /==([^=]+)==/g

    return content.replace(highlightPattern, (match, highlightedText) => {
        return `<mark class="text-highlight">${highlightedText}</mark>`
    })
}

module.exports = function (content) {
    if (typeof content !== 'string') {
        return content
    }

    let processedContent = processMermaidBlocks(content)
    processedContent = processTabbedContent(processedContent)
    processedContent = processAdmonitionBlocks(processedContent)
    processedContent = processTextHighlighting(processedContent)

    return processedContent
}

