<template>
    <div class="ccm-image-thumbnail-editor">
        <cropper
            ref="cropper"
            class="ccm-image-thumbnail-editor-cropper"
            :stencil-props="stencilProps"
            :canvas="canvas"
            :resize-image="resizeImageConfig"
            :transitions="true"
            image-restriction="none"
            :src="src"
        />
        <div class="ccm-image-thumbnail-editor-controls">
            <a @click="zoomIn" title="Zoom In (5%)"><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M8 11h3m3 0h-3m0 0V8m0 3v3M17 17l4 4M3 11a8 8 0 1016 0 8 8 0 00-16 0z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
            <a @click="zoomOut" title="Zoom Out (5%)"><svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M17 17l4 4M3 11a8 8 0 1016 0 8 8 0 00-16 0zM8 11h6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
        </div>
        <div class="ccm-image-thumbnail-editor-save">
            <button @click="save" class="btn btn-primary float-end">{{ lang.save }}</button>
        </div>
    </div>
</template>
<script>
/* eslint-disable no-new */
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
export default {
    components: {
        Cropper
    },
    props: {
        // null when the thumbnail type dimension is "Automatic"
        width: {
            type: Number,
            default: null
        },
        height: {
            type: Number,
            default: null
        },
        sizingMode: {
            type: String,
            required: true,
            validator: function(value) {
                return ['proportional', 'exact'].indexOf(value) !== -1
            }
        },
        fileId: {
            type: Number,
            required: true
        },
        fileVersionId: {
            type: Number,
            required: true
        },
        thumbnailHandle: {
            type: String,
            required: true
        },
        accessToken: {
            type: String,
            required: true
        },
        lang: {
            type: Object,
            default: () => ({
                save: 'Save'
            })
        },
        src: {
            type: String,
            required: true
        },
        uploadUrl: {
            type: String,
            required: true
        }
    },
    data: () => ({
        image: null,
        saveInProgress: false
    }),
    computed: {
        aspectRatio: function() {
            // Only lock aspect ratio for EXACT mode
            // For PROPORTIONAL mode, allow free aspect ratio (let user maintain original image ratio)
            if (this.sizingMode === 'exact') {
                return this.width / this.height
            }
            return undefined
        },
        stencilProps: function() {
            const props = {
                // Show corner handlers for resizing
                // For EXACT mode: corners maintain locked aspect ratio
                // For PROPORTIONAL mode: corners allow free resizing
                handlers: {
                    eastNorth: true, // top-right corner
                    north: false, // top edge
                    westNorth: true, // top-left corner
                    west: false, // left edge
                    westSouth: true, // bottom-left corner
                    south: false, // bottom edge
                    eastSouth: true, // bottom-right corner
                    east: false // right edge
                },
                movable: true,
                resizable: true,
                // Show border lines on all four edges for visibility
                lines: {
                    north: true,
                    east: true,
                    south: true,
                    west: true
                },
                // Style the lines for better visibility
                linesClasses: {
                    default: 'ccm-thumbnail-stencil-line',
                    north: 'ccm-thumbnail-stencil-line--north',
                    east: 'ccm-thumbnail-stencil-line--east',
                    south: 'ccm-thumbnail-stencil-line--south',
                    west: 'ccm-thumbnail-stencil-line--west'
                },
                // Add custom class to preview for border styling
                previewClass: 'ccm-thumbnail-stencil-preview'
            }

            // Only lock aspect ratio for EXACT mode
            if (this.aspectRatio !== undefined) {
                props.minAspectRatio = this.aspectRatio
                props.maxAspectRatio = this.aspectRatio
            }

            return props
        },
        resizeImageConfig: function() {
            return {
                // Don't adjust stencil size when zooming
                adjustStencil: false,
                // Enable touch zoom
                touch: true,
                // Enable smooth mouse wheel zoom with fine control (2% per wheel tick)
                wheel: {
                    ratio: 0.02
                }
            }
        },
        canvas: function() {
            // Don't restrict canvas size - let it scale naturally
            // The actual output size is controlled by getResult() parameters
            return {}
        }
    },
    methods: {
        zoomIn() {
            if (this.$refs.cropper) {
                // Zoom in by 5% (1.05x) for finer control
                this.$refs.cropper.zoom(1.05)
            }
        },
        zoomOut() {
            if (this.$refs.cropper) {
                // Zoom out by 5% (0.95x) for finer control
                this.$refs.cropper.zoom(0.95)
            }
        },
        getOutputSize(cropWidth, cropHeight) {
            if (this.sizingMode === 'exact') {
                return { width: this.width, height: this.height }
            }
            // Proportional: fit the crop inside the bounds that are set, keeping its aspect ratio
            const ratios = []
            if (this.width) {
                ratios.push(this.width / cropWidth)
            }
            if (this.height) {
                ratios.push(this.height / cropHeight)
            }
            const scale = Math.min(...ratios)
            return {
                width: Math.round(cropWidth * scale),
                height: Math.round(cropHeight * scale)
            }
        },
        save() {
            var my = this
            this.saveInProgress = true

            // Get the cropped result
            const result = this.$refs.cropper.getResult()
            const sourceCanvas = result.canvas

            if (sourceCanvas) {
                // Create a new canvas at the thumbnail size
                const size = this.getOutputSize(sourceCanvas.width, sourceCanvas.height)
                const canvas = document.createElement('canvas')
                canvas.width = size.width
                canvas.height = size.height

                // Draw the cropped image at the thumbnail size
                const ctx = canvas.getContext('2d')
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(sourceCanvas, 0, 0, size.width, size.height)

                const form = new FormData()
                form.append('ccm_token', this.accessToken)
                // Convert canvas to data URL for preview update
                const imgData = canvas.toDataURL('image/png')
                canvas.toBlob(blob => {
                    form.append('file', blob, 'thumbnail.png')
                    new ConcreteAjaxRequest({
                        url: my.uploadUrl,
                        processData: false,
                        contentType: false,
                        dataType: 'json',
                        data: form,
                        success: function(r) {
                            // Prepare event data
                            const eventData = {
                                isThumbnail: true,
                                handle: my.thumbnailHandle,
                                fID: my.fileId,
                                fvID: my.fileVersionId,
                                imgData: imgData
                            }

                            // Trigger namespaced events for different listeners
                            // Each dialog/page has its own namespace to avoid unbinding conflicts
                            Concrete.event.trigger('ImageEditorDidSave.thumbnails.thumbnailsDialog', eventData)
                            Concrete.event.trigger('ImageEditorDidSave.thumbnails.detailsPage', eventData)

                            // Show success notification
                            ConcreteAlert.notify({
                                message: ccmi18n_filemanager.thumbnailImageSaved,
                                title: ccmi18n_filemanager.thumbnailImages
                            })
                        }
                    })
                })
            }
        }
    }
}
</script>
<style scoped>
/* Stencil preview border - always visible solid white outline */
>>> .ccm-thumbnail-stencil-preview {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

/* Stencil edge lines - dashed white lines for clear visibility */
>>> .ccm-thumbnail-stencil-line {
  border-color: rgba(255, 255, 255, 0.7);
  border-style: dashed;
  border-width: 1px;
}

/* Individual line borders - only show border on the relevant edge */
>>> .ccm-thumbnail-stencil-line--north {
  border-bottom-width: 0;
  border-left-width: 0;
  border-right-width: 0;
}

>>> .ccm-thumbnail-stencil-line--east {
  border-bottom-width: 0;
  border-left-width: 0;
  border-top-width: 0;
}

>>> .ccm-thumbnail-stencil-line--south {
  border-left-width: 0;
  border-right-width: 0;
  border-top-width: 0;
}

>>> .ccm-thumbnail-stencil-line--west {
  border-bottom-width: 0;
  border-right-width: 0;
  border-top-width: 0;
}

/* Resize handlers - make corner handles more visible and easier to grab */
>>> .vue-handler-wrapper {
  opacity: 1;
}

>>> .vue-simple-handler {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  height: 12px;
  width: 12px;
}

>>> .vue-simple-handler:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.6);
  transform: scale(1.3);
}
</style>
