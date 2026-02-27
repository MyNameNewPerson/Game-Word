using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Linq;

namespace WordQuest.Gameplay
{
    public class WordWheelInput : MonoBehaviour
    {
        [Header("Components")]
        [SerializeField] private LineRenderer lineRenderer;
        [SerializeField] private Camera mainCamera;

        [Header("Configuration")]
        [SerializeField] private float letterRadius = 0.5f; // Radius for hit detection

        // Runtime state
        private bool isDragging = false;
        private List<Transform> selectedLetters = new List<Transform>();
        private List<string> currentWordChars = new List<string>();

        // Event for when a word is submitted
        public System.Action<string> OnWordSubmitted;

        private void Awake()
        {
            if (mainCamera == null) mainCamera = Camera.main;

            // Ensure line renderer is set up
            if (lineRenderer == null)
            {
                lineRenderer = GetComponent<LineRenderer>();
            }

            ResetInput();
        }

        private void Update()
        {
            HandleInput();
        }

        private void HandleInput()
        {
            // Mouse/Touch input abstraction
            bool inputDown = Input.GetMouseButtonDown(0);
            bool inputHeld = Input.GetMouseButton(0);
            bool inputUp = Input.GetMouseButtonUp(0);
            Vector3 inputPos = Input.mousePosition;

            if (inputDown)
            {
                StartDragging(inputPos);
            }
            else if (inputHeld && isDragging)
            {
                UpdateDragging(inputPos);
            }
            else if (inputUp && isDragging)
            {
                EndDragging();
            }
        }

        private void StartDragging(Vector3 screenPos)
        {
            isDragging = true;
            selectedLetters.Clear();
            currentWordChars.Clear();
            lineRenderer.positionCount = 0;

            CheckHit(screenPos);
        }

        private void UpdateDragging(Vector3 screenPos)
        {
            // 1. Check if we hit a new letter
            CheckHit(screenPos);

            // 2. Update line renderer visual
            UpdateLineVisual(screenPos);
        }

        private void EndDragging()
        {
            isDragging = false;
            lineRenderer.positionCount = 0;

            if (currentWordChars.Count > 0)
            {
                string word = string.Join("", currentWordChars);
                OnWordSubmitted?.Invoke(word);
            }

            selectedLetters.Clear();
            currentWordChars.Clear();
        }

        private void CheckHit(Vector3 screenPos)
        {
            Vector3 worldPos = mainCamera.ScreenToWorldPoint(new Vector3(screenPos.x, screenPos.y, 10f));
            worldPos.z = 0f; // Assume 2D plane

            // Simple distance check against all Letter objects in the scene
            // In a real game, we'd have a list of active Letter objects for the current level
            // Here we assume we can find them or they are children of this object
            // For this snippet, let's assume we raycast against 2D colliders

            RaycastHit2D hit = Physics2D.Raycast(worldPos, Vector2.zero);
            if (hit.collider != null)
            {
                Transform letterTransform = hit.transform;

                // Check if it's a letter (e.g. has a Letter component or tag)
                // Assuming tag "Letter" for now
                if (letterTransform.CompareTag("Letter") && !selectedLetters.Contains(letterTransform))
                {
                    AddLetter(letterTransform);
                }
            }
        }

        private void AddLetter(Transform letterTransform)
        {
            selectedLetters.Add(letterTransform);

            // Get the character from the letter object.
            // Assuming a component "LetterDisplay" with a property "Char"
            // For now, we'll try to get it from the name or a component.
            // Let's assume the name is the char or it has a component.
            // Simplified: name
            string charStr = letterTransform.name;
            currentWordChars.Add(charStr);

            // Audio feedback could go here
        }

        private void UpdateLineVisual(Vector3 currentScreenPos)
        {
            if (selectedLetters.Count == 0) return;

            lineRenderer.positionCount = selectedLetters.Count + 1;

            for (int i = 0; i < selectedLetters.Count; i++)
            {
                lineRenderer.SetPosition(i, selectedLetters[i].position);
            }

            // The last point follows the finger/cursor
            Vector3 worldPos = mainCamera.ScreenToWorldPoint(new Vector3(currentScreenPos.x, currentScreenPos.y, 10f));
            worldPos.z = 0f;
            lineRenderer.SetPosition(selectedLetters.Count, worldPos);
        }

        private void ResetInput()
        {
            isDragging = false;
            selectedLetters.Clear();
            currentWordChars.Clear();
            if (lineRenderer != null) lineRenderer.positionCount = 0;
        }
    }
}
