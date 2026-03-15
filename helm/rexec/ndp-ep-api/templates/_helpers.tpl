{{- define "ndp-ep-api.name" -}}
{{- default .Chart.Name .Values.nameOverride | lower | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ndp-ep-api.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | lower | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := include "ndp-ep-api.name" . -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | lower | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | lower | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "ndp-ep-api.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ndp-ep-api.labels" -}}
helm.sh/chart: {{ include "ndp-ep-api.chart" . }}
app.kubernetes.io/name: {{ include "ndp-ep-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app: {{ include "ndp-ep-api.name" . }}
{{- end -}}

{{- define "ndp-ep-api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ndp-ep-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: {{ include "ndp-ep-api.name" . }}
{{- end -}}
